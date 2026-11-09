/** Expose an opted-in native event that is scoped to an internal control. */
export function bridgeNativeEvent(
  host: HTMLElement,
  event: Event,
  boundary: Pick<EventInit, "bubbles" | "composed"> = {}
): boolean {
  if (event.composed) {
    return !event.defaultPrevented;
  }

  const init = { bubbles: true, composed: true, cancelable: event.cancelable, ...boundary };
  let forwarded: Event;
  if (event instanceof InputEvent) {
    forwarded = new InputEvent(event.type, {
      ...init,
      data: event.data,
      dataTransfer: event.dataTransfer,
      inputType: event.inputType,
      isComposing: event.isComposing
    });
  } else if (event instanceof SubmitEvent) {
    forwarded = new SubmitEvent(event.type, { ...init, submitter: event.submitter });
  } else if (typeof FormDataEvent !== "undefined" && event instanceof FormDataEvent) {
    forwarded = new FormDataEvent(event.type, { ...init, formData: event.formData });
  } else if (typeof ToggleEvent !== "undefined" && event instanceof ToggleEvent) {
    forwarded = new ToggleEvent(event.type, { ...init, oldState: event.oldState, newState: event.newState });
  } else {
    forwarded = new Event(event.type, init);
  }

  if (event.defaultPrevented) {
    forwarded.preventDefault();
  }
  if (!host.dispatchEvent(forwarded)) {
    event.preventDefault();
  }
  return !event.defaultPrevented;
}
