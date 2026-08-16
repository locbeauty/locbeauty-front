"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Opções padronizadas de itens por página para TODAS as listas do sistema.
export const PAGE_SIZE_OPTIONS = [ 15, 30, 50, 75 ];
export const DEFAULT_PAGE_SIZE = 15;

interface ListPaginationProps {
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Ao trocar o limite, o chamador deve voltar para a página 1. */
  onLimitChange: (limit: number) => void;
  /** Ex.: "cliente(s)", "agendamento(s)". */
  itemLabel?: string;
}

/**
 * Rodapé padrão de paginação das listas: contador de itens, seletor de
 * itens por página (15/30/50/75) e navegação por páginas numeradas.
 */
export function ListPagination({
  page,
  limit,
  totalItems,
  onPageChange,
  onLimitChange,
  itemLabel = "item(ns)",
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const MAX_VISIBLE_PAGES = 5;
  let startPage = Math.max(
    1,
    currentPage - Math.floor(MAX_VISIBLE_PAGES / 2),
  );
  const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);
  if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
  }
  const visiblePages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-4">
      <div className="text-sm text-muted-foreground">
        {totalItems} {itemLabel} encontrado(s)
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2 md:mr-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Itens por página
          </span>
          <Select
            value={ String(limit) }
            onValueChange={ (value) => onLimitChange(Number(value)) }
          >
            <SelectTrigger className="h-8 w-[75px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={ size } value={ String(size) }>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => onPageChange(1) }
            disabled={ currentPage === 1 }
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primeira página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => onPageChange(currentPage - 1) }
            disabled={ currentPage === 1 }
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          {visiblePages.map((pageNumber) => (
            <Button
              key={ pageNumber }
              variant={ currentPage === pageNumber ? "default" : "outline" }
              size="sm"
              className="h-8 w-8"
              onClick={ () => onPageChange(pageNumber) }
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => onPageChange(currentPage + 1) }
            disabled={ currentPage >= totalPages }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => onPageChange(totalPages) }
            disabled={ currentPage >= totalPages }
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
