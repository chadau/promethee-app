
import { useFlightStore } from '../store/useFlightStore';
import { useShellStore } from '../store/useShellStore';

interface TelemetryData {
    lat: number;
    lon: number;
    alt: number;
    heading: number;
    sats: number;
    fix_type: number;
    bat_level: number;
    voltage: number;
    mode: string;
    armed: boolean;
    roll: number;
    pitch: number;
    yaw: number;
    speed: number;
    climb_speed: number;
}

class DroneConnectionService {
    private ws: WebSocket | null = null;
    private pc: RTCPeerConnection | null = null;
    private controlChannel: RTCDataChannel | null = null;
    private telemetryChannel: RTCDataChannel | null = null;
    private lastTelemetry: Partial<TelemetryData> = {};

    private config: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    private token: string | null = null;
    private host: string = 'localhost:8080';
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private isExplicitDisconnect: boolean = false;

    public async connect(token: string, host: string = 'localhost:8080') {
        this.token = token;
        this.host = host;
        this.isExplicitDisconnect = false;

        // Clear any pending reconnects
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        // Close existing connection if any (without triggering reconnect logic loop immediately via flag check if possible, 
        // but here we just want to ensure clean state)
        if (this.ws) {
            this.ws.close();
            // The onclose handler might fire, but we'll handle it.
        }

        this.disconnectLogic(); // Build proper cleanup

        console.log('Initiating Drone Connection...');

        // 1. Create PC and Data Channels (Initiator)
        this.pc = new RTCPeerConnection(this.config);

        // Create Data Channels
        this.controlChannel = this.pc.createDataChannel("control");
        this.telemetryChannel = this.pc.createDataChannel("telemetry");

        this.setupTelemetryChannel();
        this.setupControlChannel();

        this.pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', this.pc?.iceConnectionState);
        };

        // 2. Create Offer
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        // 3. Wait for ICE Gathering Complete
        if (this.pc.iceGatheringState !== 'complete') {
            await new Promise<void>(resolve => {
                if (!this.pc) return resolve();
                const checkIce = () => {
                    if (!this.pc || this.pc.iceGatheringState === 'complete') {
                        this.pc?.removeEventListener('icegatheringstatechange', checkIce);
                        resolve();
                    }
                };
                this.pc.addEventListener('icegatheringstatechange', checkIce);
            });
        }

        const fullOffer = this.pc.localDescription;
        if (!fullOffer) throw new Error('Failed to generate full SDP offer');

        // 4. Connect WebSocket with Token and send Offer
        const wsUrl = `ws://${host}/ws?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Signaling WebSocket Open');
            this.sendSignal('OFFER', fullOffer.sdp);

            // Clear reconnect timeout if successful
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
        };

        this.ws.onmessage = async (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'ANSWER') {
                    console.log('Received ANSWER');
                    await this.handleAnswer(msg.sdp);
                } else if (msg.type === 'shell_output' && msg.droneId != null) {
                    useShellStore.getState().appendOutput(String(msg.droneId), msg.data ?? '');
                } else if (msg.type === 'shell_error' && msg.droneId != null) {
                    useShellStore.getState().appendError(String(msg.droneId), msg.data ?? '');
                }
            } catch (e) {
                console.error('Signaling message error:', e);
            }
        };

        this.ws.onerror = (e) => console.error('WebSocket Error:', e);

        this.ws.onclose = () => {
            console.log('WebSocket Closed');
            this.handleClose();
        };
    }

    private handleClose() {
        if (!this.isExplicitDisconnect) {
            console.log('Connection lost. Attempting to reconnect in 3s...');
            this.cleanupForReconnect();
            this.reconnectTimeout = setTimeout(() => {
                if (this.token) {
                    this.connect(this.token, this.host).catch(err => {
                        console.error("Reconnection failed:", err);
                        // Retry loop will continue due to onclose firing again on failure
                    });
                }
            }, 3000);
        }
    }

    private cleanupForReconnect() {
        if (this.controlChannel) { this.controlChannel.close(); this.controlChannel = null; }
        if (this.telemetryChannel) { this.telemetryChannel.close(); this.telemetryChannel = null; }
        if (this.pc) { this.pc.close(); this.pc = null; }
        // WS is already closed or closing
        this.ws = null;
    }

    private disconnectLogic() {
        if (this.controlChannel) this.controlChannel.close();
        if (this.telemetryChannel) this.telemetryChannel.close();
        if (this.pc) this.pc.close();
        if (this.ws) this.ws.close();

        if (this.controlLoopInterval) {
            clearInterval(this.controlLoopInterval);
            this.controlLoopInterval = null;
        }

        this.controlChannel = null;
        this.telemetryChannel = null;
        this.pc = null;
        this.ws = null;
    }

    public send(message: object) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message: WebSocket is not open');
        }
    }

    public sendDroneCommand(droneId: number, action: 'ARM' | 'DISARM' | 'TAKEOFF' | 'LAND') {
        const payload = {
            type: "COMMAND",
            target_system: droneId,
            action: action
        };
        console.log(`Sending Drone Command: ${action}`);
        this.send(payload);
    }

    public sendShellCommand(droneId: string, command: string) {
        const payload = {
            type: 'shell_command',
            droneId,
            command: command + '\n',
        };
        console.log(`[Shell] Sending to drone ${droneId}: ${command}`);
        this.send(payload);
    }

    private sendSignal(type: string, sdp: string) {
        this.send({ type, sdp });
    }

    private async handleAnswer(sdp: string) {
        if (!this.pc) return;
        const answer = new RTCSessionDescription({ type: 'answer', sdp });
        await this.pc.setRemoteDescription(answer);
        console.log('Remote Description Set (Answer)');
    }

    private setupTelemetryChannel() {
        if (!this.telemetryChannel) return;

        this.telemetryChannel.onopen = () => console.log('Telemetry Channel OPEN');
        this.telemetryChannel.onclose = () => console.log('Telemetry Channel CLOSED');

        this.telemetryChannel.onmessage = (event) => {
            try {
                let jsonString = event.data;
                if (event.data instanceof ArrayBuffer) {
                    jsonString = new TextDecoder().decode(event.data);
                }
                const data: TelemetryData = JSON.parse(jsonString);
                // console.log('Telem received:', data); // Reduced spam
                this.updateStore(data);
            } catch (e) {
                console.error('Telemetry parse error:', e);
            }
        };
        // Ensure we receive ArrayBuffers for simpler sync handling
        this.telemetryChannel.binaryType = 'arraybuffer';
    }

    private setupControlChannel() {
        if (!this.controlChannel) return;
        this.controlChannel.onopen = () => {
            console.log('Control Channel OPEN');

            // Start control loop
            if (this.controlLoopInterval) clearInterval(this.controlLoopInterval);
            this.controlLoopInterval = setInterval(() => {
                this.sendManualControl();
            }, 1000 / this.CONTROL_FREQUENCY_HZ);
        };
    }

    private updateStore(data: TelemetryData) {
        // --- Speed Optimization ---
        const SPEED_THRESHOLD = 0.2; // m/s
        let effectiveSpeed = data.speed;

        // If we have a last value and the change is within threshold, use the OLD value
        // to prevent state updates/re-renders for insignificant changes.
        if (this.lastTelemetry.speed !== undefined && Math.abs(data.speed - this.lastTelemetry.speed) < SPEED_THRESHOLD) {
            effectiveSpeed = this.lastTelemetry.speed;
        } else {
            // Otherwise, update the last known significant value
            this.lastTelemetry.speed = effectiveSpeed;
        }

        // --- Battery Optimization ---
        let effectiveBat = data.bat_level;
        if (this.lastTelemetry.bat_level !== undefined && data.bat_level === this.lastTelemetry.bat_level) {
            effectiveBat = this.lastTelemetry.bat_level;
        } else {
            this.lastTelemetry.bat_level = effectiveBat;
        }

        useFlightStore.getState().updateTelemetry({
            speed: effectiveSpeed,
            battery: effectiveBat,
        });

        // --- Altitude Optimization ---
        const ALT_THRESHOLD = 0.5; // meters
        let effectiveAlt = data.alt;
        if (this.lastTelemetry.alt !== undefined && Math.abs(data.alt - this.lastTelemetry.alt) < ALT_THRESHOLD) {
            effectiveAlt = this.lastTelemetry.alt;
        } else {
            this.lastTelemetry.alt = effectiveAlt;
        }

        useFlightStore.getState().updatePosition({
            lat: data.lat,
            lon: data.lon,
            alt: effectiveAlt, // Use filtered altitude
            heading: data.heading
        });

        useFlightStore.getState().setArmed(data.armed);
        this.lastTelemetry.armed = data.armed;
        // Map backend mode string to frontend FlightMode type if needed
        // useFlightStore.getState().setFlightMode(data.mode as FlightMode); 
    }

    public disconnect() {
        this.isExplicitDisconnect = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.disconnectLogic();
    }

    private controlLoopInterval: ReturnType<typeof setTimeout> | null = null;
    private readonly CONTROL_FREQUENCY_HZ = 30;

    public sendManualControl() {
        // Requirement: Only send if ARMED and IN FLIGHT (after takeoff)
        // We use altitude > 1m as a proxy for "after takeoff"
        const isArmed = this.lastTelemetry.armed ?? false;

        if (isArmed) {
            if (this.controlChannel && this.controlChannel.readyState === 'open') {
                const input = useFlightStore.getState().controlInput;
                const format = (val: number) => Number(val.toFixed(1));

                const payload = {
                    pitch: format(input.pitch),
                    roll: format(input.roll),
                    yaw: format(input.yaw),
                    throttle: format(input.throttle)
                };

                this.controlChannel.send(JSON.stringify(payload));
            }
        }
    }

    constructor() {
        // No subscription needed, we poll in the control loop
    }
}


export const droneConnectionService = new DroneConnectionService();
