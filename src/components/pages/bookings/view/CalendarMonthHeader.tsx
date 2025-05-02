export function CalendarMonthHeader() {
    return (
        <div className="grid grid-cols-7 border-b">
            { ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                <div key={ index } className="p-2 text-center border-r font-medium bg-muted/50">
                    { day }
                </div>
            )) }
        </div>
    );
}