### ❓ Dúvidas Pendentes

- **O que seria um cliente inativo? há muito tempo sem alugar?**

- **Cada equipamento possui algum identificador único?**

- **O que são os "OBS" na tabela INBOX INSTA ATUALIZADO 2025?**

- **Qual é o intervalo de horários disponível para agendamentos? Existe possibilidade deste horário mudar?**  
  (Exemplo: dias úteis, turnos, horários específicos, fins de semana são permitidos?)

- **Os agendamentos podem ser realizados em horários quebrados? Ou só em horas fixas?**

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

- **Existe algum interesse em guardar endereço dos funcionários?**

- **Quais são os dados necessários para cadastrar uma nova filial? Cada uma tem seu próprio CNPJ?**

- **Quais seriam boas métricas?**

---

# 📍 Filiais

| UF  | Comercial | Logística | Financeiro |
| --- | --------- | --------- | ---------- |
| PE  | 2         | 1         | ✅         |
| CE  | 2         | 1         |            |
| BA  | 2         | 1         |            |
| RJ  | 2         |           |            |
| PA  | 2         |           |            |
| ES  | 2         |           |            |
| PI  | 2         |           |            |
| RN  | 2         |           |            |

---

# 👥 Perfis e Permissões

## 🧑‍💼 Gerente

| Ação       | Cliente    | Equipamento | Regionais | Funcionários | Agendamento | Dashboard |
| ---------- | ---------- | ----------- | --------- | ------------ | ----------- | --------- |
| Cadastro   | ✅ (todas) | ✅ (todas)  | ✅        | ✅ (todas)   | ✅ (todas)  |           |
| Visualizar | ✅         | ✅          | ✅        | ✅           | ✅          | ✅        |
| Editar     | ✅         | ✅          | ✅        | ✅           | ✅          |           |
| Excluir    | ✅         | ✅          | ✅        | ✅           | ✅          |           |

---

## 💼 Comercial

| Ação       | Cliente         | Equipamento    | Regionais      | Funcionários | Agendamento     | Dashboard |
| ---------- | --------------- | -------------- | -------------- | ------------ | --------------- | --------- |
| Cadastro   | ✅ (sua região) | ❌             | ❌             | ❌           | ✅ (sua região) |           |
| Visualizar | ✅              | ✅             | ✅             | ❌           | ✅              | ❌        |
| Editar     | 🔶 (a definir)  | 🔶 (a definir) | 🔶 (a definir) | ❌           | ✅              |           |
| Excluir    | ❌              | ❌             | ❌             | ❌           | ❌              |           |

---

## 🚚 Logística

| Ação       | Cliente | Equipamento | Regionais | Funcionários | Agendamento               | Dashboard |
| ---------- | ------- | ----------- | --------- | ------------ | ------------------------- | --------- |
| Cadastro   | ❌      | ❌          | ❌        | ❌           | ❌                        |           |
| Visualizar | ❌      | ❌          | ❌        | ❌           | ✅ (apenas da sua filial) | ❌        |
| Editar     | ❌      | ❌          | ❌        | ❌           | ❌                        |           |
| Excluir    | ❌      | ❌          | ❌        | ❌           | ❌                        |           |

---

## 💰 Financeiro

| Ação       | Cliente | Equipamento | Regionais | Funcionários | Agendamento           | Dashboard |
| ---------- | ------- | ----------- | --------- | ------------ | --------------------- | --------- |
| Cadastro   | ❌      | ❌          | ❌        | ❌           | ❌                    |           |
| Visualizar | ❌      | ❌          | ❌        | ❌           | ✅ (todas as filiais) | ❌        |
| Editar     | ❌      | ❌          | ❌        | ❌           | ❌                    |           |
| Excluir    | ❌      | ❌          | ❌        | ❌           | ❌                    |           |

---

## 🚛 Motorista

| Ação       | Cliente | Equipamento | Regionais | Funcionários | Agendamento                  | Dashboard |
| ---------- | ------- | ----------- | --------- | ------------ | ---------------------------- | --------- |
| Cadastro   | ❌      | ❌          | ❌        | ❌           | ❌                           |           |
| Visualizar | ❌      | ❌          | ❌        | ❌           | ✅ (apenas atribuídos a ele) | ❌        |
| Editar     | ❌      | ❌          | ❌        | ❌           | ❌                           |           |
| Excluir    | ❌      | ❌          | ❌        | ❌           | ❌                           |           |


```