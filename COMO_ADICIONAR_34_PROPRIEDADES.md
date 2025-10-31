# Como Garantir que Todas as 34 Propriedades Apareçam

## Problema
O sistema mostra apenas 30 propriedades ao invés de 34 porque algumas propriedades não tiveram **nenhuma reserva** no último ano (período de busca: 180 dias atrás até 180 dias à frente).

## Solução Implementada
O sistema agora suporta duas formas de descobrir todas as propriedades:

### 1. Automático (Atual)
- ✅ Busca todas as propriedades que aparecem nas reservas do último ano
- ❌ Não encontra propriedades que nunca tiveram reserva nesse período

### 2. Manual (Recomendado para 100% de cobertura)
Adicione os IDs de **todas as 34 propriedades** no arquivo `.env`:

```bash
VITE_STAYS_LISTING_IDS=id1,id2,id3,id4,...,id34
```

## Como Encontrar os IDs das Propriedades

### Método 1: Através da Interface Stays.net
1. Acesse https://casap.stays.net (ou seu domínio Stays)
2. Vá em **Listings** ou **Propriedades**
3. Para cada propriedade:
   - Clique para editar
   - Na URL você verá algo como: `...listings/5e2615cae2c702001761312c`
   - O ID é a última parte: `5e2615cae2c702001761312c`
4. Copie todos os 34 IDs

### Método 2: Via API (Console do Navegador)
Abra o console do navegador (F12) na aplicação e execute:

```javascript
// Ver propriedades atualmente conhecidas
console.log('Propriedades conhecidas:', Array.from(window.allListingsMap?.keys() || []));
```

### Método 3: Verificar Logs da Aplicação
O sistema agora loga quantas propriedades foram encontradas:

```
📊 Found 30 listings from bookings
🔍 Fetching 4 missing listings from Content API...
✅ Total listings map: 34 properties
```

Se aparecer "Fetching X missing listings", o sistema tentará buscar os 4 faltantes automaticamente **SE** você adicionar os IDs no `.env`.

## Configuração Final

1. Abra o arquivo `.env`
2. Descomente e preencha a linha:

```bash
VITE_STAYS_LISTING_IDS=5e2615cae2c702001761312c,5e2615cae2c702001761312d,5e2615cae2c702001761312e,...
```

3. Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Verifique no console do navegador:
   - Deve aparecer: `✅ Total listings map: 34 properties`

## Verificação

Após adicionar os IDs:

1. Abra o Dashboard
2. Role até a seção **Acomodações vazias**
3. Conte os cards - devem aparecer **34 acomodações**
4. No calendário, as **34 linhas** devem estar visíveis

## Importante

- ⚠️ **Sem os IDs no .env**: Sistema mostra apenas propriedades com reservas no último ano (~30)
- ✅ **Com os IDs no .env**: Sistema busca detalhes das 4 faltantes via API e mostra todas as 34
- 🔄 **Cache**: Os dados são atualizados automaticamente a cada 5 minutos

## Troubleshooting

### "Ainda aparece apenas 30"
1. Verifique se reiniciou o servidor após editar `.env`
2. Verifique se os IDs estão separados por vírgula, sem espaços
3. Verifique no console do navegador se há erros de API

### "Como sei quais IDs estão faltando?"
O sistema loga automaticamente:
```
🔍 Fetching 4 missing listings from Content API...
✅ Fetched: I-VP-455-503
✅ Fetched: I-VP-455-504
⚠️ Could not fetch listing abc123: Error...
```

Se aparecer erro ao buscar um ID, verifique se o ID está correto na API Stays.
