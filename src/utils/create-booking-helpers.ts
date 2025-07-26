// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { Dispatch, SetStateAction } from "react";
// import { UseFormSetValue, UseFormTrigger } from "react-hook-form";

// // Check if a range contains any unavailable hours
// export const hasUnavailableHoursInRange = (start: number, end: number) => {
//     for (let i = start; i <= end; i++) {
//         const hourObj = availableHours.find((h) => h.hour === i);
//         if (hourObj && !hourObj.available) {
//             return true;
//         }
//     }
//     return false;
// };

// // Check if an hour is within the selected range
// export const isHourInRange = (hour: number, watchStartHour: number | null, hoverHour: number | null, watchEndHour: number | null) => {
//     if (watchStartHour === null) return false;
//     if (watchEndHour === null) {
//         if (hour === watchStartHour) return true;
//         if (hoverHour !== null) {
//             const min = Math.min(watchStartHour, hoverHour);
//             const max = Math.max(watchStartHour, hoverHour);
//             if (hour >= min && hour <= max) {
//                 return !hasUnavailableHoursInRange(min, max);
//             }
//         }
//         return false;
//     }
//     return hour >= watchStartHour && hour <= watchEndHour;
// };

// // Check if an hour is valid as an end hour
// export const isValidEndHour = (hour: number, watchStartHour: number | null) => {
//     if (watchStartHour === null) return false;
//     const min = Math.min(watchStartHour, hour);
//     const max = Math.max(watchStartHour, hour);
//     return !hasUnavailableHoursInRange(min, max);
// };

// // Get badge styling based on selection state
// export const getBadgeStyle = (hour: number, available: boolean, watchStartHour: number | null, watchEndHour: number | null, hoverHour: number | null) => {
//     if (!available) return "cursor-not-allowed opacity-50";

//     if (isHourInRange(hour, watchStartHour, hoverHour, watchEndHour)) {
//         if (hour === watchStartHour && (hour === watchEndHour || watchEndHour === null)) {
//             return "cursor-pointer bg-primary text-primary-foreground";
//         } else if (hour === watchStartHour) {
//             return "cursor-pointer bg-primary text-primary-foreground rounded-r-none";
//         } else if (hour === watchEndHour || (watchEndHour === null && hour === hoverHour && isValidEndHour(hour, watchStartHour))) {
//             return "cursor-pointer bg-primary text-primary-foreground rounded-l-none";
//         } else {
//             return "cursor-pointer bg-primary/80 text-primary-foreground rounded-none";
//         }
//     }

//     if (watchStartHour !== null && watchEndHour === null && isValidEndHour(hour, watchStartHour)) {
//         return "cursor-pointer hover:bg-primary/50 hover:text-primary-foreground";
//     }

//     return "cursor-pointer hover:bg-primary/20";
// };

// // Handle mouse enter on badge
// export const handleMouseEnter = (hour: number, available: boolean, watchStartHour: number | null, watchEndHour: number | null, setHoverHour: Dispatch<SetStateAction<number | null>>) => {
//     if (!available) return;
//     if (watchStartHour !== null && watchEndHour === null) {
//         setHoverHour(hour);
//     }
// };

// // Handle mouse leave on badge
// export const handleMouseLeave = (setHoverHour: Dispatch<SetStateAction<number | null>>) => {
//     setHoverHour(null);
// };

// // Handle clicking on a time badge
// export const handleTimeClick = (hour: number, available: boolean, watchStartHour: number | null, watchEndHour: number | null, setValue: UseFormSetValue<any>, trigger: UseFormTrigger<any>) => {
//     if (!available) return;

//     if (watchStartHour === null) {
//         // First click - set start hour
//         setValue("startHour", hour);
//         setValue("endHour", null);
//     } else if (watchEndHour === null) {
//         // Second click - validate and set end hour
//         const min = Math.min(watchStartHour, hour);
//         const max = Math.max(watchStartHour, hour);

//         if (hasUnavailableHoursInRange(min, max)) {
//             // TODO: Add toast notification
//             // toast.error("Seleção inválida", {
//             //     description: "Não é possível selecionar um intervalo que inclua horários indisponíveis.",
//             // });
//             window.alert("Não é possível selecionar um intervalo que inclua horários indisponíveis.");
//             return;
//         }

//         setValue("startHour", min);
//         setValue("endHour", max);
//         trigger("startHour"); // Trigger validation
//     } else {
//         // Reset and start new selection
//         setValue("startHour", hour);
//         setValue("endHour", null);
//     }
// };

// export const clearSelection = (setValue: UseFormSetValue<any>) => {
//     setValue("date", null);
//     setValue("startHour", null);
//     setValue("endHour", null);
// };
