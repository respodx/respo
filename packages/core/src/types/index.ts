export interface ViewportPreset {
  /** Unique identifier used as React key and CSS selector */
  id: string;
  /** Human-readable label shown under the frame */
  label: string;
  /** Device category for grouping */
  device: 'mobile' | 'tablet' | 'desktop';
  /** Logical width in CSS pixels (before scale transform) */
  width: number;
  /** Logical height in CSS pixels (before scale transform) */
  height: number;
}

export interface ViewportFrameProps {
  preset: ViewportPreset;
  src: string;
  scale: number;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  isFocused?: boolean | undefined;
  isBlurred?: boolean | undefined;
  onToggleFocus?: ((id: string) => void) | undefined;
}

export interface ControlBarProps {
  activeViewportIds: string[];
  onToggleViewport: (id: string) => void;
  onClose: () => void;
  focusedId?: string | null | undefined;
  onResetFocus?: (() => void) | undefined;
  onStartTour?: (() => void) | undefined;
}

export interface ViewportGridProps {
  activePresets: ViewportPreset[];
  src: string;
  iframeRefs: React.RefObject<HTMLIFrameElement | null>[];
  focusedId?: string | null | undefined;
  onToggleFocus?: ((id: string) => void) | undefined;
}

export interface DevWidgetProps {
  /** Override the URL loaded in iframes. Defaults to window.location.href. */
  src?: string | undefined;
  /** Which viewport IDs are active by default */
  defaultViewports?: string[] | undefined;
  /** Force enable even in production environments */
  enabled?: boolean | undefined;
}

export interface MirrorScrollPayload {
  scrollX: number;
  scrollY: number;
  sourceId: string;
}

export interface MirrorClickPayload {
  x: number;
  y: number;
  sourceId: string;
}

export interface MirrorInputPayload {
  selector: string;
  value: string;
  sourceId: string;
}
