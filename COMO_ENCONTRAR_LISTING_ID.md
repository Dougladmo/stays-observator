# Como Encontrar o Listing ID

Para que o dashboard funcione, você precisa dos **Listing IDs** das suas acomodações no sistema Stays.

## 📋 Formatos Aceitos

A API Stays aceita dois formatos de Listing ID:

### Formato Longo (24 caracteres hexadecimais)
```
Exemplo: 5e2615cae2c702001761312c
```

### Formato Curto (Código)
```
Pattern: AB123C
Formato: [A-Z]{2}[0-9]{2,4}[A-Z]{1}
Exemplo: CA456P
```

## 🔍 Onde Encontrar

### Opção 1: Na Interface Stays
1. Acesse https://casap.stays.net
2. Login: `4778d135` / Senha: `de01570c`
3. Vá até a seção de **Acomodações** ou **Listings**
4. Clique em uma acomodação para ver seus detalhes
5. O ID estará na URL ou nos detalhes da acomodação

### Opção 2: Via API (se tiver endpoint de listagem)
```bash
curl -X GET "https://casap.stays.net/external/v1/listings" \
  -H "Authorization: Basic NDc3OGQxMzU6ZGUwMTU3MGM=" \
  -H "Content-Type: application/json"
```

### Opção 3: Contato com Suporte
Entre em contato com o suporte Stays e solicite os Listing IDs das suas acomodações.

## ✅ Testando um Listing ID

Depois de obter um ID, teste se funciona:

```bash
# Substitua SEU_LISTING_ID pelo ID real
curl -X GET "https://casap.stays.net/external/v1/calendar/listing/SEU_LISTING_ID?from=2025-10-30&to=2025-11-05" \
  -H "Authorization: Basic NDc3OGQxMzU6ZGUwMTU3MGM=" \
  -H "Content-Type: application/json"
```

### Resposta Esperada (Sucesso)
```json
[
  {
    "date": "2025-10-30",
    "avail": 1,
    "closedToArrival": false,
    "closedToDeparture": false,
    "prices": [
      {
        "minStay": 2,
        "_mcval": {
          "BRL": 150
        }
      }
    ]
  }
]
```

### Resposta de Erro (ID Inválido)
```json
{
  "message": "request/params/listingId must match pattern...",
  "errors": [...]
}
```

## 📝 Configurando no Dashboard

Depois de obter os IDs, edite o arquivo `.env`:

```env
# Para uma única acomodação
VITE_STAYS_LISTING_IDS=5e2615cae2c702001761312c

# Para múltiplas acomodações (separadas por vírgula)
VITE_STAYS_LISTING_IDS=5e2615cae2c702001761312c,5e2615cae2c702001761312d,5e2615cae2c702001761312e
```

Depois reinicie o servidor:
```bash
npm run dev
```

## 🆘 Ainda com Dúvidas?

Se não conseguir encontrar os Listing IDs:

1. **Verifique a documentação** da sua conta Stays
2. **Entre em contato** com o administrador do sistema
3. **Solicite ao suporte** Stays uma lista dos seus listings

O dashboard está pronto para funcionar assim que você fornecer os IDs corretos! 🎉
