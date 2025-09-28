# 📱 Formatador de Contatos Google + Validação WhatsApp

**Ferramenta gratuita** para formatar planilhas CSV do Google Contacts para padrões brasileiros. Formata números, valida DDDs, completa números incompletos e integra com **API Evolution** para validação WhatsApp. Interface moderna, responsiva e fácil de usar.

## 🌐 **Teste Online**

**🚀 [Acesse a ferramenta online](https://relaxsolucoes.github.io/formatador-contatos-google/)**

Teste todas as funcionalidades diretamente no navegador, sem necessidade de instalação!

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

1. **Acesse a ferramenta** em [relaxsolucoes.github.io/formatador-contatos-google](https://relaxsolucoes.github.io/formatador-contatos-google/)
2. **Configure** o DDD padrão e nome padrão
3. **Arraste** seu arquivo CSV do Google Contacts
4. **Aguarde** o processamento automático
5. **Baixe** o arquivo formatado
6. **Valide WhatsApp** (opcional) com API Evolution

## ⚙️ Configurações

### DDD Padrão
- Para números incompletos (ex: 99988-7766)
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
- **Entrada**: 11999887766, 011999887766, 999887766
- **Saída**: 5511999887766 (padrão brasileiro)

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

- **Marketing Digital**: Limpeza de listas de contatos para campanhas
- **WhatsApp Business**: Validação de números para envio de mensagens
- **CRM**: Padronização de dados de clientes
- **Importação**: Preparação para sistemas de gestão
- **E-commerce**: Validação de contatos de clientes
- **Agências**: Processamento em massa de listas de contatos
- **Empresas**: Padronização de base de dados

## 📁 Estrutura do Projeto

```
├── index.html          # Interface principal otimizada para SEO
├── script.js           # Lógica de processamento e validação
├── style.css           # Estilos responsivos e modernos
├── README.md           # Documentação completa
├── robots.txt          # SEO - direcionamento de crawlers
├── sitemap.xml         # SEO - mapa do site para indexação
└── .git/               # Controle de versão Git
```

## 🔧 Instalação Local

1. Clone o repositório
2. Abra `index.html` no navegador
3. Funciona offline (sem servidor)

## 📄 Licença

MIT License - Uso livre para projetos pessoais e comerciais.

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou pull request.

## ❓ FAQ - Perguntas Frequentes

### Como funciona a formatação de números?
A ferramenta converte números para o padrão brasileiro (55 + DDD + número), remove zeros iniciais e valida DDDs.

### É necessário instalar algo?
Não! A ferramenta funciona 100% no navegador, sem necessidade de instalação.

### A validação WhatsApp é obrigatória?
Não, é opcional. Você pode usar apenas a formatação de números.

### Quais formatos de arquivo são aceitos?
Apenas arquivos CSV exportados do Google Contacts.

### Os dados ficam seguros?
Sim! Todo processamento acontece localmente no seu navegador.

### Posso usar para fins comerciais?
Sim! A ferramenta é gratuita para uso pessoal e comercial.

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/RelaxSolucoes/formatador-contatos-google/issues)
- **Documentação**: Este README
- **Exemplos**: Use o arquivo de exemplo do Google Contacts

## 🔗 Links Úteis

- **🚀 [Ferramenta Online](https://relaxsolucoes.github.io/formatador-contatos-google/)** - Teste diretamente no navegador
- [Google Contacts](https://contacts.google.com/) - Exportar contatos
- [API Evolution](https://whats-evolution-v2.vercel.app/) - Validação WhatsApp
- [GitHub Pages](https://pages.github.com/) - Hospedagem gratuita

---

**Desenvolvido com ❤️ para facilitar a formatação de contatos brasileiros**
