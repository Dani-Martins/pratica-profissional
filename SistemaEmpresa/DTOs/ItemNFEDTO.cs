using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ItemNFEDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "NFE é obrigatória")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Número do item é obrigatório")]
        public int NumeroItem { get; set; }

        [Required(ErrorMessage = "Produto é obrigatório")]
        public long ProdutoId { get; set; }

        [Required(ErrorMessage = "Quantidade é obrigatória")]
        [Range(0.001, 999999.999, ErrorMessage = "Quantidade deve estar entre 0,001 e 999.999,999")]
        public decimal Quantidade { get; set; }

        [Required(ErrorMessage = "Valor unitário é obrigatório")]
        [Range(0.01, 999999.99, ErrorMessage = "Valor unitário deve estar entre 0,01 e 999.999,99")]
        public decimal ValorUnitario { get; set; }

        [Required(ErrorMessage = "Valor total é obrigatório")]
        [Range(0.01, 999999.99, ErrorMessage = "Valor total deve estar entre 0,01 e 999.999,99")]
        public decimal ValorTotal { get; set; }

        public decimal? ValorDesconto { get; set; }

        public bool Ativo { get; set; }

        public NFEDTO? NFE { get; set; }
        public ProdutoDTO? Produto { get; set; }
    }

    public class CreateItemNFEDTO
    {
        [Required(ErrorMessage = "NFE é obrigatória")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Número do item é obrigatório")]
        public int NumeroItem { get; set; }

        [Required(ErrorMessage = "Produto é obrigatório")]
        public long ProdutoId { get; set; }

        [Required(ErrorMessage = "Quantidade é obrigatória")]
        [Range(0.001, 999999.999, ErrorMessage = "Quantidade deve estar entre 0,001 e 999.999,999")]
        public decimal Quantidade { get; set; }

        [Required(ErrorMessage = "Valor unitário é obrigatório")]
        [Range(0.01, 999999.99, ErrorMessage = "Valor unitário deve estar entre 0,01 e 999.999,99")]
        public decimal ValorUnitario { get; set; }

        [Required(ErrorMessage = "Valor total é obrigatório")]
        [Range(0.01, 999999.99, ErrorMessage = "Valor total deve estar entre 0,01 e 999.999,99")]
        public decimal ValorTotal { get; set; }

        public decimal? ValorDesconto { get; set; }
    }

    public class UpdateItemNFEDTO : CreateItemNFEDTO
    {
        public bool Ativo { get; set; }
    }
}