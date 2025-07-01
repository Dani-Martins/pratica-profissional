using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class FaturaDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "NFE é obrigatória")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Número da fatura é obrigatório")]
        [StringLength(60, ErrorMessage = "Número da fatura deve ter no máximo 60 caracteres")]
        public string Numero { get; set; } = string.Empty;

        [Required(ErrorMessage = "Valor original é obrigatório")]
        [Range(0.01, 999999999.99, ErrorMessage = "Valor original deve estar entre 0,01 e 999.999.999,99")]
        public decimal ValorOriginal { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do desconto deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorDesconto { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor líquido deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorLiquido { get; set; }

        [Required(ErrorMessage = "Vencimento é obrigatório")]
        public DateTime Vencimento { get; set; }

        public bool Ativo { get; set; }

        public NFEDTO? NFE { get; set; }
    }

    public class CreateFaturaDTO
    {
        [Required(ErrorMessage = "NFE é obrigatória")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Número da fatura é obrigatório")]
        [StringLength(60, ErrorMessage = "Número da fatura deve ter no máximo 60 caracteres")]
        public string Numero { get; set; } = string.Empty;

        [Required(ErrorMessage = "Valor original é obrigatório")]
        [Range(0.01, 999999999.99, ErrorMessage = "Valor original deve estar entre 0,01 e 999.999.999,99")]
        public decimal ValorOriginal { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor do desconto deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorDesconto { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor líquido deve estar entre 0 e 999.999.999,99")]
        public decimal? ValorLiquido { get; set; }

        [Required(ErrorMessage = "Vencimento é obrigatório")]
        public DateTime Vencimento { get; set; }
    }

    public class UpdateFaturaDTO : CreateFaturaDTO
    {
        public bool Ativo { get; set; }
    }
}