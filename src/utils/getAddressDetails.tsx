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