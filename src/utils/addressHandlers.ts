import {
  FieldValues,
  Path,
  PathValue,
  UseFormClearErrors,
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

export interface GetViaCepAddressDetailsResponse {
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

interface HandleZipCodeChangeParams<T extends FieldValues> {
  e: React.ChangeEvent<HTMLInputElement>;
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  setError: UseFormSetError<T>;
  isUpdateForm?: boolean;
  setIsLoadingZipCode: (_value: boolean) => void;
  clearErrors: UseFormClearErrors<T>;
  onCepDataFetched?: (data: GetViaCepAddressDetailsResponse | null) => void;
}

export async function handleCepChange<T extends FieldValues>({
  e,
  setValue,
  trigger,
  setIsLoadingZipCode,
  setError,
  clearErrors,
  isUpdateForm = false,
  onCepDataFetched,
}: HandleZipCodeChangeParams<T>) {
  const zipCodeParsed = e.target.value.replace(/\D/g, "");

  const zipCode: Path<T> = (
    isUpdateForm ? "zipCode" : "address.zipCode"
  ) as Path<T>;
  const city: Path<T> = (
    isUpdateForm ? "cityName" : "address.cityName"
  ) as Path<T>;
  const state: Path<T> = (
    isUpdateForm ? "stateName" : "address.stateName"
  ) as Path<T>;
  const neighborhood: Path<T> = (
    isUpdateForm ? "neighborhoodName" : "address.neighborhoodName"
  ) as Path<T>;
  const street: Path<T> = (
    isUpdateForm ? "streetName" : "address.streetName"
  ) as Path<T>;

  const zipCodeValue = e.target.value.replace(/\D/g, "");

  // Salva o CEP formatado (00000-000) no campo do form
  const formatted =
    zipCodeValue.length >= 6
      ? `${zipCodeValue.slice(0, 5)}-${zipCodeValue.slice(5, 8)}`
      : zipCodeValue;
  setValue(zipCode, formatted as PathValue<T, typeof zipCode>);

  if (zipCodeParsed.length === 0) clearErrors(zipCode);
  if (zipCodeValue.length !== 8) return;

  try {
    setIsLoadingZipCode(true);
    clearErrors(zipCode);

    const response = await getAddressDetails(zipCodeValue);

    if (onCepDataFetched) {
      onCepDataFetched(response);
    }

    if (!response) {
      setError(zipCode, { message: "CEP não encontrado." });

      setValue(city, "" as PathValue<T, typeof city>);
      setValue(neighborhood, "" as PathValue<T, typeof neighborhood>);
      setValue(street, "" as PathValue<T, typeof street>);
      setValue(state, "" as PathValue<T, typeof state>);
      return;
    }

    setValue(city, response.localidade as PathValue<T, typeof city>);
    setValue(
      neighborhood,
      (response.bairro || "") as PathValue<T, typeof neighborhood>,
    );
    setValue(street, (response.logradouro || "") as PathValue<T, typeof street>);
    setValue(state, response.uf as PathValue<T, typeof state>);

    trigger([ city, neighborhood, street, state ]);
  } catch (error) {
    setError(zipCode, { message: "Erro ao buscar o CEP." });
    console.warn("Error: ", error);
  } finally {
    setIsLoadingZipCode(false);
  }
}

export async function getAddressDetails(
  zipCode: string,
): Promise<GetViaCepAddressDetailsResponse | null> {
  const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);

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
