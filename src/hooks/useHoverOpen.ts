"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

interface UseHoverOpenOptions {
  /** Desativa o hover (ex.: popover dentro de dialog modal). */
  enabled?: boolean;
  /** Delay antes de fechar depois que o mouse sai (ms). */
  closeDelay?: number;
}

/**
 * Controla um Popover para abrir no hover e fechar quando o mouse sai do
 * trigger e do conteúdo (timer único compartilhado — mover entre os dois não
 * fecha). Clique/teclado continuam funcionando via onOpenChange do Radix.
 * Só ativa em dispositivos com hover real (desktop); em touch fica click-only.
 */
export function useHoverOpen({
  enabled = true,
  closeDelay = 200,
}: UseHoverOpenOptions = {}) {
  const [ open, setOpenState ] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Após um fechamento via onOpenChange (seleção concluída, clique no trigger,
  // Escape), o conteúdo desmonta sob o cursor e o browser dispara mouseenter
  // no que ficou embaixo — sem esta janela o popover reabriria na hora.
  const suppressHoverUntilRef = useRef(0);

  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)", {
    initializeWithValue: false,
  });
  const hoverEnabled = enabled && canHover;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearCloseTimer, [ clearCloseTimer ]);

  const onOpenChange = useCallback(
    (next: boolean) => {
      clearCloseTimer();
      if (!next) suppressHoverUntilRef.current = Date.now() + 350;
      setOpenState(next);
    },
    [ clearCloseTimer ],
  );

  const onMouseEnter = useCallback(() => {
    if (!hoverEnabled) return;
    clearCloseTimer();
    if (Date.now() < suppressHoverUntilRef.current) return;
    setOpenState(true);
  }, [ hoverEnabled, clearCloseTimer ]);

  const onMouseLeave = useCallback(() => {
    if (!hoverEnabled) return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpenState(false), closeDelay);
  }, [ hoverEnabled, clearCloseTimer, closeDelay ]);

  return {
    open,
    /** Fecha/abre programaticamente (com supressão de reabertura por hover). */
    setOpen: onOpenChange,
    onOpenChange,
    triggerProps: { onMouseEnter, onMouseLeave },
    contentProps: { onMouseEnter, onMouseLeave },
  };
}
