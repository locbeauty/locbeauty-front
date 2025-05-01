export function CalendarFooter() {
    return (
        <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-300"></div>
                <span className="text-sm">4 horas</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-100 border border-pink-300"></div>
                <span className="text-sm">6 horas</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300"></div>
                <span className="text-sm">8-12 horas</span>
            </div>
        </div>
    );
}