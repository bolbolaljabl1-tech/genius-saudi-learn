import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useActivityDelay } from "@/hooks/useActivityDelay";

afterEach(() => vi.useRealTimers());

describe("activity completion delays", () => {
  it("completes a mounted activity once", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const { result } = renderHook(useActivityDelay);
    act(() => result.current(complete, 450));
    act(() => vi.advanceTimersByTime(450));
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("does not award an activity abandoned before its completion delay", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const { result, unmount } = renderHook(useActivityDelay);
    act(() => result.current(complete, 450));
    unmount();
    act(() => vi.advanceTimersByTime(450));
    expect(complete).not.toHaveBeenCalled();
  });
});