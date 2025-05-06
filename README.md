
### ❓ Dúvidas Pendentes

- **Qual é o intervalo de horários disponível para agendamentos?**  
  (Exemplo: dias úteis, turnos, horários específicos, fins de semana são permitidos?)

- **Quem poderá criar/editar/excluir as entidades?**  

- **Para clientes Pessoa Jurídica (PJ), é obrigatório registrar a data de nascimento?**  
  (Ou esse campo é opcional/não utilizado em todos os casos?)

- **Cada filial possui seu próprio gerente ou há um gerente responsável por múltiplas filiais(região)?**  
  (Como é organizada a hierarquia dos gestores?)

- **O setor financeiro está presente em todas as filiais ou é centralizado em uma única unidade?**

- **Quando um equipamento é transferido para outra região, ele retorna à sua filial de origem?**  
  (Ou permanece onde foi enviado, retornando apenas se houver necessidade?)

- **Cada equipamento terá sua filial de origem, quantidade disponível/quantidade total?** 
 
- **O equipamento é alugado pra qual fim? (Evento, estabelecimento, ...)**  

- **Fluxo para agendamento de um equipamento que pode ser transferido:**  
- - checar se equipamento está disponível no determinado dia;
- - checar estoque disponível;
- - checar o tempo de deslocamento;

---


# 📍 Filiais

| UF | Comercial | Logística | Financeiro |
|----|-----------|-----------|------------|
| PE | 2         | 1         | ✅          |
| CE | 2         | 1         |            |
| BA | 2         | 1         |            |
| RJ | 2         |           |            |
| PA | 2         |           |            |
| ES | 2         |           |            |
| PI | 2         |           |            |
| RN | 2         |           |            |

---

# 👥 Perfis e Permissões

## 🧑‍💼 Gerente

| Ação        | Cliente | Equipamento | Regionais | Funcionários | Agendamento | Dashboard |
|-------------|---------|-------------|-----------|--------------|-------------|-----------|
| Cadastro    | ✅ (todas) | ✅ (todas)     | ✅         | ✅ (todas)      | ✅ (todas)     |           |
| Visualizar  | ✅       | ✅           | ✅         | ✅            | ✅           | ✅         |
| Editar      | ✅       | ✅           | ✅         | ✅            | ✅           |           |
| Excluir     | ✅       | ✅           | ✅         | ✅            | ✅           |           |

---

## 💼 Comercial

| Ação        | Cliente           | Equipamento | Regionais | Funcionários | Agendamento       | Dashboard |
|-------------|-------------------|-------------|-----------|--------------|-------------------|-----------|
| Cadastro    | ✅ (sua região)    | ❌           | ❌         | ❌            | ✅ (sua região)     |           |
| Visualizar  | ✅                 | ✅           | ✅         | ❌            | ✅                 | ❌         |
| Editar      | 🔶 (a definir)     | 🔶 (a definir)| 🔶 (a definir)| ❌        | ✅                 |           |
| Excluir     | ❌                 | ❌           | ❌         | ❌            | ❌                 |           |

---

## 🚚 Logística

| Ação        | Cliente | Equipamento | Regionais | Funcionários | Agendamento             | Dashboard |
|-------------|---------|-------------|-----------|--------------|--------------------------|-----------|
| Cadastro    | ❌       | ❌           | ❌         | ❌            | ❌                        |           |
| Visualizar  | ❌       | ❌           | ❌         | ❌            | ✅ (apenas da sua filial) | ❌         |
| Editar      | ❌       | ❌           | ❌         | ❌            | ❌                        |           |
| Excluir     | ❌       | ❌           | ❌         | ❌            | ❌                        |           |

---

## 💰 Financeiro

| Ação        | Cliente | Equipamento | Regionais | Funcionários | Agendamento         | Dashboard |
|-------------|---------|-------------|-----------|--------------|----------------------|-----------|
| Cadastro    | ❌       | ❌           | ❌         | ❌            | ❌                    |           |
| Visualizar  | ❌       | ❌           | ❌         | ❌            | ✅ (todas as filiais) | ❌         |
| Editar      | ❌       | ❌           | ❌         | ❌            | ❌                    |           |
| Excluir     | ❌       | ❌           | ❌         | ❌            | ❌                    |           |

---

## 🚛 Motorista

| Ação        | Cliente | Equipamento | Regionais | Funcionários | Agendamento                  | Dashboard |
|-------------|---------|-------------|-----------|--------------|-------------------------------|-----------|
| Cadastro    | ❌       | ❌           | ❌         | ❌            | ❌                             |           |
| Visualizar  | ❌       | ❌           | ❌         | ❌            | ✅ (apenas atribuídos a ele)  | ❌         |
| Editar      | ❌       | ❌           | ❌         | ❌            | ❌                             |           |
| Excluir     | ❌       | ❌           | ❌         | ❌            | ❌                             |           |

---

# 📝 Formulários de Cliente

## Pessoa Física (PF)

```json
{
  "personType": "PF",
  "birthday": "2025-05-08",
  "customerName": "Ateste",
  "companyName": "",
  "email": "teste@teste.com",
  "cellphone": "(11) 11111-1111",
  "instagram": "asdasdasd",
  "city": "teste",
  "UF": "PE",
  "neighborhood": "teste",
  "street": "teste",
  "houseNumber": "11111111",
  "CPF": "111.111.111-11",
  "CNPJ": ""
}
```

## Pessoa Jurídica (PJ)

```json
{
  "personType": "PJ",
  "birthday": "",
  "customerName": "",
  "companyName": "teste",
  "email": "teste@teste.com",
  "cellphone": "(81) 97332-8630",
  "instagram": "asdasdas",
  "city": "teste",
  "UF": "PE",
  "neighborhood": "teste",
  "street": "teste",
  "houseNumber": "1123",
  "CPF": "",
  "CNPJ": "11.111.111/1111-11"
}
```

---

🔶 *Os campos marcados com "a definir" podem ser ajustados conforme regras de negócio futuras.*

---
