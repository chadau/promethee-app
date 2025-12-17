import React from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';

// Cesium Token (Ideally this should be in .env, using default/public for now or none if just local)
// Note: Cesium works without a token for dev/local with limited features, but a token is recommended for terrain.
// For this mockup, we'll try standard access.

export const Globe: React.FC = () => {
    return (
        <div className="w-full h-full bg-black/40 relative overflow-hidden rounded-xl border border-white/5 shadow-inner">
            <Viewer
                full
                timeline={false}
                animation={false}
                infoBox={false}
                navigationHelpButton={false}
                homeButton={false}
                geocoder={false}
                baseLayerPicker={true} // Allow changing maps for now
                sceneModePicker={false}
                selectionIndicator={false}
                fullscreenButton={false}
                className="w-full h-full"
            >
                {/* Example Drone Entity */}
                <Entity
                    name="Prométhée Drone"
                    position={Cartesian3.fromDegrees(2.3522, 48.8566, 2000)} // Paris
                    point={{ pixelSize: 15, color: Color.CYAN }}
                    description="Target Drone Unit"
                />
            </Viewer>
        </div>
    );
};
