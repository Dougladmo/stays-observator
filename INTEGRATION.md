# Integração com a API Stays.net

Este documento descreve a integração do Dashboard com a API Stays.net e como configurá-la.

## 📋 Visão Geral

O projeto foi integrado com a API Listing Calendar da Stays.net para buscar dados reais de disponibilidade e ocupação. A integração é **híbrida** devido às limitações da API disponível:

### ✅ Dados da API Stays (Implementado)
- **Estatísticas de Ocupação**: Acomodações disponíveis vs. ocupadas (calculado a partir da disponibilidade)
- **Ocupação 30 Dias**: Estatísticas de ocupação para os próximos 30 dias
- **Tendência de Ocupação**: Gráfico mostrando taxa de ocupação diária
- **Acomodações Vazias**: Lista de unidades disponíveis hoje

### ⚠️ Dados Mock (Temporário)
- **Detalhes de Hóspedes**: Códigos de reserva, status (check-in/check-out/hospedado)
- **Origem das Reservas**: Distribuição por plataforma (Airbnb, Booking, etc.)

> **Nota**: A API Listing Calendar não fornece informações detalhadas de reservas/hóspedes. Esses dados continuam usando mock até que endpoints adicionais sejam disponibilizados.

## 🔧 Configuração

### 1. Obter Credenciais da API

Você precisa das seguintes credenciais da sua conta Stays.net:

- **Client ID**: Identificador do cliente da API
- **Client Secret**: Chave secreta para autenticação
- **Listing ID(s)**: ID(s) das acomodações que deseja monitorar

### 2. Configurar Variáveis de Ambiente

1. **Copie o arquivo de exemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env`** e preencha com suas credenciais:
   ```env
   VITE_STAYS_API_BASE_URL=https://casap.stays.net
   VITE_STAYS_CLIENT_ID=seu_client_id_aqui
   VITE_STAYS_CLIENT_SECRET=seu_client_secret_aqui
   VITE_STAYS_LISTING_IDS=id1,id2,id3
   ```

   > **Nota sobre Listing IDs**: A API aceita dois formatos:
   > - **Formato longo**: 24 caracteres hexadecimais (ex: `5e2615cae2c702001761312c`)
   > - **Formato curto**: Pattern `AB123C` (2 letras maiúsculas + 2-4 dígitos + 1 letra maiúscula)
   >
   > Para múltiplos listings, separe os IDs por vírgula.

### 3. Reiniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

## 🏗️ Arquitetura da Integração

### Estrutura de Diretórios
```
src/
├── services/
│   ├── config.ts                 # Configuração de variáveis de ambiente
│   └── api/
│       ├── types.ts              # TypeScript types da API Stays
│       ├── staysApi.ts           # Cliente da API com autenticação
│       └── transformers.ts       # Transformação de dados API → Dashboard
├── hooks/
│   └── useStaysData.ts           # React hook para gerenciar dados da API
└── App.tsx                       # Integração principal
```

### Fluxo de Dados

```
1. App.tsx usa useStaysData()
   ↓
2. useStaysData() chama staysApi.getCalendarForMultipleListings()
   ↓
3. staysApi faz requisições HTTP autenticadas
   ↓
4. transformers.ts converte StaysCalendarDay[] → OccupancyStats
   ↓
5. Dashboard recebe dados processados
```

## 📊 Mapeamento de Dados

### API Response → Dashboard Data

| API Stays | Dashboard | Transformação |
|-----------|-----------|---------------|
| `avail: 0` | Unidade ocupada | `avail === 0` → ocupada |
| `avail > 0` | Unidade disponível | `avail > 0` → disponível |
| Array de `StaysCalendarDay[]` | `OccupancyStats` | Cálculo de disponível/ocupado |
| Array de `StaysCalendarDay[]` | `occupancyTrend` | Taxa diária de ocupação |
| `avail > 0` no dia atual | `availableUnits[]` | Filtro de unidades disponíveis |

### Exemplo de Resposta da API

```json
[
  {
    "date": "2025-10-30",
    "avail": 0,
    "closedToArrival": false,
    "closedToDeparture": false,
    "prices": [
      {
        "minStay": 2,
        "_mcval": {
          "BRL": 150,
          "USD": 30
        }
      }
    ]
  }
]
```

## 🎯 Estados da Aplicação

### 1. **Configuração Inválida**
Exibido quando variáveis de ambiente estão faltando:
- Mostra lista de variáveis necessárias
- Instrui usuário a configurar `.env`

### 2. **Carregando**
Spinner animado enquanto busca dados da API

### 3. **Erro de API**
Exibido quando há falha na requisição:
- Mostra mensagem de erro
- Botão para tentar novamente
- Sugere verificar credenciais

### 4. **Dashboard com Dados**
Exibe dashboard completo com dados da API

## 🔐 Autenticação

A API usa **Basic Authentication** com Base64:

```typescript
Authorization: Basic base64(client_id:client_secret)
```

A autenticação é gerenciada automaticamente pelo `StaysApiClient` em `src/services/api/staysApi.ts`.

## 🚀 Funcionalidades Implementadas

### `useStaysData()` Hook

```typescript
const {
  weekData,              // Dados da semana (ainda mock)
  occupancyStats,        // Estatísticas de hoje (API)
  occupancyNext30Days,   // Ocupação 30 dias (API)
  reservationOrigins,    // Origem reservas (mock)
  occupancyTrend,        // Tendência ocupação (API)
  availableUnits,        // Unidades disponíveis (API)
  loading,               // Estado de carregamento
  error,                 // Mensagem de erro
  configValid,           // Validação de configuração
  refetch,               // Função para recarregar dados
} = useStaysData();
```

### Transformers Disponíveis

```typescript
// Calcula estatísticas de ocupação
calculateOccupancyStats(calendarData, dateFilter?)

// Calcula tendência de ocupação
calculateOccupancyTrend(calendarData)

// Obtém unidades disponíveis em uma data
getAvailableUnits(calendarData, targetDate)

// Gera intervalo de datas
getDateRange(startDate, days)

// Verifica se data está nos próximos N dias
isWithinNextDays(dateStr, days)
```

## 🔄 Próximos Passos

Para implementação completa, você precisará de:

1. **API de Reservas**: Endpoint que retorne detalhes de reservas com:
   - Código da reserva
   - Unidade alocada
   - Status (check-in, check-out, hospedado)
   - Datas de entrada/saída
   - Origem da reserva (Airbnb, Booking, etc.)

2. **Atualização do Hook**: Modificar `useStaysData.ts` para buscar dados de reservas

3. **Remover Mock Data**: Substituir `mockDashboardData` por dados reais da API

## 🐛 Troubleshooting

### Erro: "Configuração Inválida"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que todas as variáveis `VITE_STAYS_*` estão preenchidas
- Reinicie o servidor de desenvolvimento após editar `.env`

### Erro: "Stays API error: Unauthorized"
- Verifique suas credenciais `CLIENT_ID` e `CLIENT_SECRET`
- Confirme que as credenciais têm permissão para acessar a API

### Erro: "Stays API error: Not Found"
- Verifique se os `LISTING_IDS` estão corretos
- Confirme que os listings existem na sua conta Stays

### Erro: "Listing ID inválido"
- A API requer IDs em formatos específicos:
  - **Formato longo**: 24 caracteres hexadecimais (ex: `5e2615cae2c702001761312c`)
  - **Formato curto**: `AB123C` (2 letras + 2-4 dígitos + 1 letra)
- Verifique seus IDs na plataforma Stays
- Teste com: `curl -X GET "https://casap.stays.net/external/v1/calendar/listing/SEU_ID?from=2025-10-30&to=2025-11-05" -H "Authorization: Basic NDc3OGQxMzU6ZGUwMTU3MGM="`

### Dashboard não atualiza
- Use `Ctrl+Shift+R` para recarregar sem cache
- Verifique o console do navegador para erros
- Teste a API diretamente com curl:
  ```bash
  curl -X GET "https://casap.stays.net/external/v1/calendar/listing/SEU_LISTING_ID?from=2025-10-30&to=2025-11-05" \
    -H "Authorization: Basic $(echo -n '4778d135:de01570c' | base64)"
  ```

## 📚 Referências

- [Documentação da API Stays.net](https://stays.net/external-api/#listing-calendar-api)
- Documentação local: `Documentação da API Stays.net - Listing Calendar.md`
- Vite Environment Variables: https://vitejs.dev/guide/env-and-mode.html

## 📝 Notas de Desenvolvimento

- A API retorna dados de disponibilidade, não de ocupação direta
- `avail: 0` é interpretado como "unidade ocupada"
- `avail > 0` é interpretado como "unidade disponível"
- O hook busca dados para 37 dias (7 para visualização semanal + 30 para tendências)
- Requisições são feitas em paralelo para múltiplos listings
- Dados são atualizados automaticamente no mount do componente
- Use `refetch()` para atualizar manualmente

---

**Status**: ✅ Integração parcial concluída - aguardando API de reservas para dados completos
