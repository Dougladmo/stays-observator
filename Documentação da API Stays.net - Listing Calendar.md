# Documentação da API Stays.net - Listing Calendar

Esta documentação detalha os endpoints, parâmetros e exemplos de uso da API Listing Calendar da Stays.net, projetada para fornecer e atualizar informações de disponibilidade, preços e restrições de anúncios.

## Visão Geral

A API Listing Calendar permite que desenvolvedores acessem e manipulem dados de calendário para anúncios específicos, incluindo:

- **Recuperar Calendário:** Obter informações sobre disponibilidade, preços e restrições para um determinado período.
- **Atualizar Calendário:** Modificar preços e restrições para um intervalo de datas.
- **Atualizar Valores de Tarifa:** Atualizar especificamente os valores de tarifa.
- **Atualizar Restrições:** Modificar as restrições de chegada e partida.

## Autenticação

Todas as requisições à API devem ser autenticadas usando autenticação Básica (Basic Authentication). O cabeçalho `Authorization` deve ser enviado com um hash base64 do `client_id` e `client_secret`.

**Exemplo de Cabeçalho de Autorização:**

```
Authorization: Basic <hash_base64(client_id:client_secret)>
```

## Endpoints da API

A seguir, uma descrição detalhada de cada endpoint disponível na API Listing Calendar.

### 1. Recuperar Calendário do Anúncio (Retrieve Listing Calendar)

Este endpoint retorna informações de disponibilidade, preços e restrições por data para um anúncio específico.

- **Método HTTP:** `GET`
- **Endpoint:** `/external/v1/calendar/listing/{listingId}`

#### Parâmetros

| Tipo | Parâmetro | Tipo de Dado | Descrição |
| --- | --- | --- | --- |
| Path | `listingId` | String | Identificador único do anúncio. Aceita IDs curtos e longos. |
| Query | `from` | String | Data de início para o retorno dos dados (formato `YYYY-MM-DD`). **Obrigatório**. |
| Query | `to` | String | Data de fim para o retorno dos dados (formato `YYYY-MM-DD`). **Obrigatório**. |
| Query | `ignorePriceGroupUnits` | Boolean | Se `true`, ignora a disponibilidade para unidades de grupo de preços, retornando apenas a disponibilidade do anúncio principal. |
| Query | `ignoreCloneGroupUnits` | Boolean | Se `true`, ignora a disponibilidade para unidades de grupo de clones, retornando apenas a disponibilidade do anúncio principal. |

#### Exemplo de Requisição

```bash
curl -X GET "https://play.stays.net/external/v1/calendar/listing/5e2615cae2c702001761312c?from=2023-06-09&to=2023-06-11" \
  -H "Authorization: Basic ODAwOTQxMTU1NjpNTHlHTEl3RkFX" \
  -H "Content-Type: application/json"
```

#### Exemplo de Resposta

```json
[
  {
    "date": "2023-06-09",
    "avail": 0,
    "closedToArrival": false,
    "closedToDeparture": false,
    "prices": [
      {
        "minStay": 2,
        "_mcval": {
          "USD": 10,
          "BRL": 50,
          "EUR": 11
        }
      }
    ]
  },
  {
    "date": "2023-06-10",
    "avail": 1,
    "closedToArrival": false,
    "closedToDeparture": false,
    "prices": [
      {
        "minStay": 2,
        "_mcval": {
          "USD": 10,
          "BRL": 50,
          "EUR": 11
        }
      }
    ]
  }
]
```

### 2. Atualizar Calendário do Anúncio (Update Listing Calendar)

Este endpoint atualiza informações de preços e restrições para um anúncio em um determinado intervalo de datas.

- **Método HTTP:** `PATCH`
- **Endpoint:** `/external/v1/calendar/listing/{listingId}/batch`

#### Parâmetros

| Tipo | Parâmetro | Tipo de Dado | Descrição |
| --- | --- | --- | --- |
| Path | `listingId` | String | Identificador do anúncio. Suporta identificadores longos e curtos. |
| Body | `from` | String | Data de início da atualização (formato `YYYY-MM-DD`). **Obrigatório**. |
| Body | `to` | String | Data de fim da atualização (formato `YYYY-MM-DD`). **Obrigatório**. |
| Body | `prices` | Array | Array de objetos de preço. **Obrigatório**. |
| Body | `prices.minStay` | Integer | Restrição de estadia mínima para aplicar o preço. |
| Body | `prices._f_val` | Number | Valor do preço na moeda do anúncio. |
| Body | `closedToArrival` | Boolean | Restrição de chegada. **Obrigatório**. |
| Body | `closedToDeparture` | Boolean | Restrição de partida. **Obrigatório**. |

#### Exemplo de Requisição

```bash
curl -X PATCH "https://play.stays.net/external/v1/calendar/listing/5e2615cae2c702001761312c/batch" \
  -H "Authorization: Basic ODAwOTQxMTU1NjpNTHlHTEl3RkFX" \
  -H "Content-Type: application/json" \
  -d '[
  {
    "from": "2023-07-09",
    "to": "2023-07-11",
    "closedToArrival": true,
    "closedToDeparture": true,
    "prices": [
      {
        "minStay": 2,
        "_f_val": 100
      }
    ]
  }
]'
```

### 3. Atualizar Valores de Tarifa (Update Rate Values)

Este endpoint é usado para atualizar os valores de tarifa de um anúncio para um intervalo de datas específico.

- **Método HTTP:** `PATCH`
- **Endpoint:** `/external/v1/calendar/listing/{listingId}/prices`

#### Parâmetros

| Tipo | Parâmetro | Tipo de Dado | Descrição |
| --- | --- | --- | --- |
| Path | `listingId` | String | Identificador do anúncio. |
| Body | `from` | String | Data de início da atualização (formato `YYYY-MM-DD`). **Obrigatório**. |
| Body | `to` | String | Data de fim da atualização (formato `YYYY-MM-DD`). **Obrigatório**. |
| Body | `prices` | Array | Array de objetos de preço. **Obrigatório**. |
| Body | `prices.minStay` | Integer | Restrição de estadia mínima para aplicar o preço. **Obrigatório**. |
| Body | `prices._f_val` | Number | Valor do preço na moeda do anúncio. **Obrigatório**. |

#### Exemplo de Requisição

```bash
curl -X PATCH "https://play.stays.net/external/v1/calendar/listing/5e2615cae2c702001761312c/prices" \
  -H "Authorization: Basic ODAwOTQxMTU1NjpNTHlHTEl3RkFX" \
  -H "Content-Type: application/json" \
  -d '{
  "from": "2023-06-09",
  "to": "2023-06-10",
  "prices": [
    {
      "minStay": 2,
      "_f_val": 50
    }
  ]
}'
```

### 4. Atualizar Restrição (Update Restriction)

Este endpoint permite a atualização das restrições de chegada e partida para um anúncio em um determinado período.

- **Método HTTP:** `PATCH`
- **Endpoint:** `/external/v1/calendar/listing/{listingId}/restrictions`

#### Parâmetros

| Tipo | Parâmetro | Tipo de Dado | Descrição |
| --- | --- | --- | --- |
| Path | `listingId` | String | Identificador do anúncio. |
| Body | `from` | String | Data de início da atualização (formato `YYYY-MM-DD`). **Obrigatório**. |
| Body | `to` | String | Data de fim da atualização (formato `YYYY-MM-DD`). **Obrigatório**. |
| Body | `closedToArrival` | Boolean | Restrição de chegada. **Obrigatório**. |
| Body | `closedToDeparture` | Boolean | Restrição de partida. **Obrigatório**. |

#### Exemplo de Requisição

```bash
curl -X PATCH "https://play.stays.net/external/v1/calendar/listing/5e2615cae2c702001761312c/restrictions" \
  -H "Authorization: Basic ODAwOTQxMTU1NjpNTHlHTEl3RkFX" \
  -H "Content-Type: application/json" \
  -d '{
  "from": "2023-06-09",
  "to": "2023-06-10",
  "closedToArrival": false,
  "closedToDeparture": false
}'
```

## Objetos de Dados

Abaixo estão as descrições dos principais objetos de dados retornados pela API.

### Objeto de Resposta

| Parâmetro | Tipo de Dado | Descrição |
| --- | --- | --- |
| `date` | String | Data de referência (formato `YYYY-MM-DD`). |
| `avail` | Integer | Número de unidades disponíveis. |
| `closedToArrival` | Boolean | Indica se a chegada está restrita. |
| `closedToDeparture` | Boolean | Indica se a partida está restrita. |
| `prices` | Array | Array de objetos de preço. |
| `prices.minStay` | Integer | Restrição de estadia mínima para aplicar o preço. |
| `prices._mcval` | Object | Objeto com valores em múltiplas moedas. |
| `monthlyPrice` | Object | Opcional. Existe se um preço mensal estiver configurado nas regras de preço. |
| `monthlyPrice.minStay` | Integer | Restrição de estadia mínima para aplicar o preço mensal. |
| `monthlyPrice._mcval` | Object | Objeto com valores mensais em múltiplas moedas. |

---
*Esta documentação foi gerada com base nas informações disponíveis em [Stays.net External API](https://stays.net/external-api/#listing-calendar-api) em 30 de outubro de 2025.*
