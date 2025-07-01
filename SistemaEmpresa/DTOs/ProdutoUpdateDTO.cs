using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ProdutoUpdateDTO
    {
        [Required]
        public long Id { get; set; }
        public string? CodigoBarras { get; set; }
        public string? Referencia { get; set; }
        public int? UnidadeMedidaId { get; set; }
        public int? MarcaId { get; set; }
        public int? CategoriaId { get; set; }
        public int? QuantidadeMinima { get; set; }
        public decimal? ValorCompra { get; set; }
        public decimal? ValorVenda { get; set; }
        public int? Quantidade { get; set; }
        public decimal? PercentualLucro { get; set; }
        public string? Observacoes { get; set; }
        public DateTime? Situacao { get; set; }
        public DateTime? DataCriacao { get; set; }
        public DateTime? DataAlteracao { get; set; }
        public string? UserCriacao { get; set; }
        public string? UserAtualizacao { get; set; }
    }
}
