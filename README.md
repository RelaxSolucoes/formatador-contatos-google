# 📱 Formatador de Contatos Google + Validação WhatsApp

Ferramenta web para formatar planilhas CSV do Google Contacts para padrões brasileiros. Formata números, valida DDDs, completa números incompletos e integra com API Evolution para validação WhatsApp.

## ✨ Funcionalidades

- **Formatação Automática**: Converte números para padrão brasileiro (55 + DDD + número)
- **Validação de DDD**: Verifica se o DDD é válido (11-99)
- **Completar Números**: Adiciona DDD padrão para números incompletos
- **Múltiplos Números**: Suporta vários números por contato (separados por :::)
- **Nomes Padrão**: Usa nome configurável para contatos sem nome válido
- **Debug Detalhado**: Mostra números e nomes removidos com motivos
- **Validação WhatsApp**: Integração com API Evolution para validar números
- **Interface Moderna**: Drag-and-drop, responsiva e intuitiva

## 🚀 Como Usar

1. **Acesse a ferramenta** no GitHub Pages
2. **Configure** o DDD padrão e nome padrão
3. **Arraste** seu arquivo CSV do Google Contacts
4. **Aguarde** o processamento automático
5. **Baixe** o arquivo formatado
6. **Valide WhatsApp** (opcional) com API Evolution

## ⚙️ Configurações

### DDD Padrão
- Para números incompletos (ex: 99887-7665)
- Padrão: 19 (configurável)

### Nome Padrão
- Para contatos sem nome válido
- Padrão: "Cliente" (configurável)

## 📱 Validação WhatsApp

### Requisitos
- API Evolution ativa
- Instância WhatsApp conectada
- Server URL, Instance ID e API Key

### Configuração
1. Clique em "Validar WhatsApp"
2. Preencha os dados da API
3. Teste a conexão
4. Inicie a validação em lotes

### API Evolution
- **Gratuita**: 7 dias de teste
- **Sem cartão**: Ativação instantânea
- **Link**: [whats-evolution-v2.vercel.app](https://whats-evolution-v2.vercel.app/)

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo e moderno
- **JavaScript ES6**: Lógica de processamento
- **API Evolution**: Validação WhatsApp

## 📊 Processamento

### Números Formatados
- **Entrada**: 19999887766, 019999887766, 999887766
- **Saída**: 5519999887766 (padrão brasileiro)

### Validações
- ✅ DDDs válidos (11-99)
- ✅ Comprimento correto (10-11 dígitos)
- ✅ Código do país 55
- ✅ Números limpos (sem caracteres especiais)

### Debug
- 📞 Números removidos com motivos
- 👤 Nomes removidos com motivos
- 📊 Estatísticas detalhadas

## 🎯 Casos de Uso

- **Marketing Digital**: Limpeza de listas de contatos
- **WhatsApp Business**: Validação de números
- **CRM**: Padronização de dados
- **Importação**: Preparação para sistemas

## 📁 Estrutura do Projeto

```
├── index.html          # Interface principal
├── script.js           # Lógica de processamento
├── style.css           # Estilos e responsividade
└── README.md           # Documentação
```

## 🔧 Instalação Local

1. Clone o repositório
2. Abra `index.html` no navegador
3. Funciona offline (sem servidor)

## 📄 Licença

MIT License - Uso livre para projetos pessoais e comerciais.

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou pull request.

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/SEU_USUARIO/SEU_REPOSITORIO/issues)
- **Documentação**: Este README
- **Exemplos**: Use o arquivo de exemplo do Google Contacts

---

**Desenvolvido com ❤️ para facilitar a formatação de contatos brasileiros**
