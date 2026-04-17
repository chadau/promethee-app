// ──────────────────────────────────────────────
// PROMÉTHÉE — UI Editor Store
// ──────────────────────────────────────────────
// Transient UI state for the dashboard editor.
// No persistence needed — resets on refresh.

import { create } from 'zustand';

interface UiEditorState {
    isEditMode: boolean;
    isWidgetPickerOpen: boolean;
    isSettingsModalOpen: boolean;
    selectedWidgetInstanceId: string | null;
    previewDashboardId: string | null;

    // Actions
    toggleEditMode: () => void;
    setEditMode: (value: boolean) => void;
    openWidgetPicker: () => void;
    closeWidgetPicker: () => void;
    toggleSettingsModal: () => void;
    closeSettingsModal: () => void;
    selectWidget: (instanceId: string | null) => void;
    setPreviewDashboard: (id: string | null) => void;
    resetEditor: () => void;
}

const INITIAL_STATE = {
    isEditMode: false,
    isWidgetPickerOpen: false,
    isSettingsModalOpen: false,
    selectedWidgetInstanceId: null,
    previewDashboardId: null,
};

export const useUiEditorStore = create<UiEditorState>()((set) => ({
    ...INITIAL_STATE,

    toggleEditMode: () =>
        set((state) => ({
            isEditMode: !state.isEditMode,
            // Close panels when exiting edit mode
            ...(!state.isEditMode
                ? {}
                : {
                    isWidgetPickerOpen: false,
                    isSettingsModalOpen: false,
                    selectedWidgetInstanceId: null,
                }),
        })),

    setEditMode: (value) =>
        set({
            isEditMode: value,
            ...(value
                ? {}
                : {
                    isWidgetPickerOpen: false,
                    isSettingsModalOpen: false,
                    selectedWidgetInstanceId: null,
                }),
        }),

    openWidgetPicker: () => set({ isWidgetPickerOpen: true }),
    closeWidgetPicker: () => set({ isWidgetPickerOpen: false }),

    toggleSettingsModal: () =>
        set((state) => ({ isSettingsModalOpen: !state.isSettingsModalOpen })),
    closeSettingsModal: () => set({ isSettingsModalOpen: false }),

    selectWidget: (instanceId) =>
        set({ selectedWidgetInstanceId: instanceId }),

    setPreviewDashboard: (id) => set({ previewDashboardId: id }),

    resetEditor: () => set(INITIAL_STATE),
}));
