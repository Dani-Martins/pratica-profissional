using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class NFEDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Número é obrigatório")]
        public int Numero { get; set; }

        [Required(ErrorMessage = "Série é obrigatória")]
        [StringLength(3, ErrorMessage = "Série deve ter no máximo 3 caracteres")]
        public string Serie { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de emissão é obrigatória")]
        public DateTime DataEmissao { get; set; }

        [Required(ErrorMessage = "Natureza da operação é obrigatória")]
        [StringLength(60, ErrorMessage = "Natureza da operação deve ter no máximo 60 caracteres")]
        public string NaturezaOperacao { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tipo de operação é obrigatório")]
        public int TipoOperacao { get; set; }

        [Required(ErrorMessage = "Valor total é obrigatório")]
        [Range(0, 999999999.99, ErrorMessage = "Valor total deve estar entre 0 e 999.999.999,99")]
        public decimal ValorTotal { get; set; }

        [Required(ErrorMessage = "Valor de produtos é obrigatório")]
        [Range(0, 999999999.99, ErrorMessage = "Valor de produtos deve estar entre 0 e 999.999.999,99")]
        public decimal ValorProdutos { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do frete deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorFrete { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do seguro deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorSeguro { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do desconto deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorDesconto { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Outras despesas devem estar entre 0 e 999.999.999,99")]
        public decimal? OutrasDespesas { get; set; }

        [Required(ErrorMessage = "Emitente é obrigatório")]
        public long EmitenteId { get; set; }

        [Required(ErrorMessage = "Destinatário é obrigatório")]
        public long DestinatarioId { get; set; }

        public long? TransportadoraId { get; set; }

        public bool Ativo { get; set; }

        public TransportadoraDTO? Transportadora { get; set; }
        public ICollection<ItemNFEDTO>? Itens { get; set; }
        public ICollection<FaturaDTO>? Faturas { get; set; }
    }

    public class CreateNFEDTO
    {
        [Required(ErrorMessage = "Número é obrigatório")]
        public int Numero { get; set; }

        [Required(ErrorMessage = "Série é obrigatória")]
        [StringLength(3, ErrorMessage = "Série deve ter no máximo 3 caracteres")]
        public string Serie { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de emissão é obrigatória")]
        public DateTime DataEmissao { get; set; }

        [Required(ErrorMessage = "Natureza da operação é obrigatória")]
        [StringLength(60, ErrorMessage = "Natureza da operação deve ter no máximo 60 caracteres")]
        public string NaturezaOperacao { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tipo de operação é obrigatório")]
        public int TipoOperacao { get; set; }

        [Required(ErrorMessage = "Valor total é obrigatório")]
        [Range(0, 999999999.99, ErrorMessage = "Valor total deve estar entre 0 e 999.999.999,99")]
        public decimal ValorTotal { get; set; }

        [Required(ErrorMessage = "Valor de produtos é obrigatório")]
        [Range(0, 999999999.99, ErrorMessage = "Valor de produtos deve estar entre 0 e 999.999.999,99")]
        public decimal ValorProdutos { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do frete deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorFrete { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do seguro deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorSeguro { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do desconto deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorDesconto { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Outras despesas devem estar entre 0 e 999.999.999,99")]
        public decimal? OutrasDespesas { get; set; }

        [Required(ErrorMessage = "Emitente é obrigatório")]
        public long EmitenteId { get; set; }

        [Required(ErrorMessage = "Destinatário é obrigatório")]
        public long DestinatarioId { get; set; }

        public long? TransportadoraId { get; set; }
    }

    public class UpdateNFEDTO : CreateNFEDTO
    {
        public bool Ativo { get; set; }
    }
}