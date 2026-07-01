export function CalendarFooter() {
  return (
    <div className="flex flex-col gap-2">
      {/* Em andamento: cor pela duração da locação */}
      <div className="flex flex-wrap items-center gap-4 justify-center">
        <span className="text-sm font-medium text-muted-foreground">
          Em andamento:
        </span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 border border-orange-600"></div>
          <span className="text-sm">Menos de 6h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-200 border border-yellow-300"></div>
          <span className="text-sm">6 a 7h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-300 border border-green-400"></div>
          <span className="text-sm">8h ou mais</span>
        </div>
      </div>

      {/* Locação encerrada: cor pelo status de pagamento */}
      <div className="flex flex-wrap items-center gap-4 justify-center">
        <span className="text-sm font-medium text-muted-foreground">
          Locação encerrada:
        </span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-800 border border-green-900"></div>
          <span className="text-sm">Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-700 border border-red-900"></div>
          <span className="text-sm">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-600 border border-yellow-700"></div>
          <span className="text-sm">Parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500 border border-gray-600"></div>
          <span className="text-sm">Cortesia / Reembolsado / Cancelado</span>
        </div>
      </div>
    </div>
  );
}
