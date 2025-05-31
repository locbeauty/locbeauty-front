import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Fragment } from "react";

interface ResponsiveCardProps<T = unknown> {
    cardData: {
        id: string,
        title: string,
        description: string,
        transferableIndicator?: boolean
        transferable?: boolean
        items: {
            itemLabel: string,
            itemInfo: string | number
        }[],
    },
    rawData: T,

    handleToggleCustomerDetailsDialog: (_openStatus: boolean, _targetData: T) => void
}

export function ResponsiveCard<T = unknown>({ handleToggleCustomerDetailsDialog, cardData: { id, title, description, transferableIndicator = false, transferable, items }, rawData }: ResponsiveCardProps<T>) {

    return (
        <div className="space-y-4 md:hidden">
            <Card key={ id } className="p-4 hover:bg-muted/50 cursor-pointer" onClick={ () => handleToggleCustomerDetailsDialog(true, rawData) }>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    {transferableIndicator && (
                        <div className={ `flex items-center gap-1 ${transferable ? "text-green-500" : "text-red-500"}` }>
                            {transferable ? (
                                <>
                                    <Check className="h-5 w-5" />
                                    <span className="text-xs font-medium">Transferível</span>
                                </>
                            ) : (
                                <>
                                    <X className="h-5 w-5" />
                                    <span className="text-xs font-medium">Não transferível</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {
                        items.map(({ itemLabel, itemInfo }, index) => (
                            <Fragment key={ index }>
                                <div className="font-medium">{itemLabel}</div>
                                <div>{itemInfo}</div>
                            </Fragment>
                        ))
                    }
                </div>
            </Card>
        </div>
    );
}