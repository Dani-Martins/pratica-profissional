using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ProdutoDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "Descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Descrição reduzida deve ter no máximo 100 caracteres")]
        public string? DescricaoReduzida { get; set; }

        [StringLength(14, ErrorMessage = "GTIN deve ter no máximo 14 caracteres")]
        public string? GTIN { get; set; }

        [StringLength(8, ErrorMessage = "NCM deve ter no máximo 8 caracteres")]
        public string? NCM { get; set; }

        [StringLength(7, ErrorMessage = "CEST deve ter no máximo 7 caracteres")]
        public string? CEST { get; set; }

        [Range(0, 999999.999, ErrorMessage = "Peso bruto deve estar entre 0 e 999.999,999")]
        public decimal? PesoBruto { get; set; }

        [Range(0, 999999.999, ErrorMessage = "Peso líquido deve estar entre 0 e 999.999,999")]
        public decimal? PesoLiquido { get; set; }

        public int? UnidadeMedidaId { get; set; }
        public string? CodigoBarras { get; set; }
        public string? Referencia { get; set; }
        public int? MarcaId { get; set; }
        public int? CategoriaId { get; set; }
        public int? QuantidadeMinima { get; set; }
        public decimal? ValorCompra { get; set; }
        public decimal? ValorVenda { get; set; }
        public int? Quantidade { get; set; }
        public decimal? PercentualLucro { get; set; }
        public string? Observacoes { get; set; }
        public DateTime? Situacao { get; set; }

        public bool Ativo { get; set; }
    }

    public class CreateProdutoDTO
    {
        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "Descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Descrição reduzida deve ter no máximo 100 caracteres")]
        public string? DescricaoReduzida { get; set; }

        [StringLength(14, ErrorMessage = "GTIN deve ter no máximo 14 caracteres")]
        public string? GTIN { get; set; }

        [StringLength(8, ErrorMessage = "NCM deve ter no máximo 8 caracteres")]
        public string? NCM { get; set; }

        [StringLength(7, ErrorMessage = "CEST deve ter no máximo 7 caracteres")]
        public string? CEST { get; set; }

        [Range(0, 999999.999, ErrorMessage = "Peso bruto deve estar entre 0 e 999.999,999")]
        public decimal? PesoBruto { get; set; }

        [Range(0, 999999.999, ErrorMessage = "Peso líquido deve estar entre 0 e 999.999,999")]
        public decimal? PesoLiquido { get; set; }

        public int? UnidadeMedidaId { get; set; }
        public string? CodigoBarras { get; set; }
        public string? Referencia { get; set; }
        public int? MarcaId { get; set; }
        public int? CategoriaId { get; set; }
        public int? QuantidadeMinima { get; set; }
        public decimal? ValorCompra { get; set; }
        public decimal? ValorVenda { get; set; }
        public int? Quantidade { get; set; }
        public decimal? PercentualLucro { get; set; }
        public string? Observacoes { get; set; }
        public DateTime? Situacao { get; set; }
    }

    public class UpdateProdutoDTO : CreateProdutoDTO
    {
        public bool Ativo { get; set; }
    }
}