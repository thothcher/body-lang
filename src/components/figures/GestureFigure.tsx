import * as React from "react";
import BodyFigure from "./BodyFigure";
import SeatedFigure from "./SeatedFigure";
import HandSign, { type HandSignKind } from "./HandSign";
import FaceSignal, { type FaceSignalKind } from "./FaceSignal";
import { SEATED_POSES } from "./poses";
import type { Gesture } from "@/lib/content/gestures";

export interface GestureFigureProps {
  gesture: Pick<Gesture, "figure" | "pose" | "title">;
  className?: string;
  showFocus?: boolean;
  /** სათაური გამორთულია თამაშებში, რომ პასუხი არ გამჟღავნდეს */
  labelled?: boolean;
}

/** ირჩევს სწორ ილუსტრატორს ჟესტის ტიპის მიხედვით. */
export default function GestureFigure({
  gesture,
  className,
  showFocus = true,
  labelled = true,
}: GestureFigureProps) {
  const title = labelled ? gesture.title : undefined;

  if (gesture.figure === "hand") {
    return <HandSign sign={gesture.pose as HandSignKind} className={className} title={title} />;
  }
  if (gesture.figure === "face") {
    return (
      <FaceSignal
        pose={gesture.pose as FaceSignalKind}
        className={className}
        title={title}
        showOverlay={showFocus}
      />
    );
  }
  if (SEATED_POSES[gesture.pose]) {
    return <SeatedFigure pose={gesture.pose} className={className} title={title} showFocus={showFocus} />;
  }
  return <BodyFigure pose={gesture.pose} className={className} title={title} showFocus={showFocus} />;
}
