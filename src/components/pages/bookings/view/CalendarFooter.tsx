export function CalendarFooter() {
    return (
        <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-4h-duration-background border border-4h-duration-border"></div>
                <span className="text-sm">4 horas</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-6h-duration-background border border-6h-duration-border"></div>
                <span className="text-sm">6 horas</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-8h-12h-duration-background border border-8h-12h-duration-border"></div>
                <span className="text-sm">8-12 horas</span>
            </div>
        </div>
    );
}