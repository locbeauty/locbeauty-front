import {
    FieldValues,
    Path,
    PathValue,
    UseFormClearErrors,
    UseFormSetError,
    UseFormSetValue,
    UseFormTrigger,
} from "react-hook-form";

export interface GetAddressDetailsResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    unidade: string;
    bairro: string;
    localidade: string;
    uf: string;
    estado: string;
    regiao: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
}

interface HandleCepChangeParams<T extends FieldValues> {
  e: React.ChangeEvent<HTMLInputElement>;
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  setError: UseFormSetError<T>
  setIsLoadingCep: (_value: boolean) => void;
    clearErrors: UseFormClearErrors<T>
}

export async function handleCepChange<T extends FieldValues>({ e, setValue, trigger, setIsLoadingCep, setError, clearErrors }: HandleCepChangeParams<T>) {
    const cep = e.target.value.replace(/\D/g, "");

    const {
        CEP = "CEP" as Path<T>,
        city = "city" as Path<T>,
        state = "state" as Path<T>,
        neighborhood = "neighborhood" as Path<T>,
        street = "street" as Path<T>,
    } = {};
    const cepValue = e.target.value.replace(/\D/g, "");

    if (cep.length === 0) clearErrors(CEP);
    if (cepValue.length !== 8) return;

    try {
        setIsLoadingCep(true);
        clearErrors(CEP);

        const response = await getAddressDetails(cepValue);

        if (!response) {
            setError(CEP, { message: "CEP não encontrado." });

            setValue(city, "" as PathValue<T, typeof city>);
            setValue(neighborhood, "" as PathValue<T, typeof neighborhood>);
            setValue(street, "" as PathValue<T, typeof street>);
            setValue(state, "" as PathValue<T, typeof state>);
            return;
        }

        setValue(city, response.localidade as PathValue<T, typeof city>);
        setValue(neighborhood, response.bairro as PathValue<T, typeof neighborhood>);
        setValue(street, response.logradouro as PathValue<T, typeof street>);
        setValue(state, response.estado as PathValue<T, typeof state>);

        trigger([ city, neighborhood, street, state ]);
    } catch (error) {
        setError(CEP, { message: "Erro ao buscar o CEP." });
        console.warn("Error: ", error);
    } finally {
        setIsLoadingCep(false);
    }
}

export async function getAddressDetails(cep: string): Promise<GetAddressDetailsResponse | null> {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
        console.error("Erro HTTP:", response.status);
        return null;
    }

    const data = await response.json();

    if (data.erro) {
        return null;
    }

    return data;
}
