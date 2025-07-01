using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("produto")]
    public class Produto
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("nome")]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Column("descricao")]
        public string? Descricao { get; set; }

        [Column("estoque")]
        public int Estoque { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        public int? EstoqueMinimo { get; set; }

        [Column("datacriacao")]
        public DateTime? DataCriacao { get; set; }

        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; }

        [Column("user_criacao")]
        [StringLength(100)]
        public string? UserCriacao { get; set; }

        [Column("user_atualizacao")]
        [StringLength(100)]
        public string? UserAtualizacao { get; set; }

        [Column("unidademedidaid")]
        public int? UnidadeMedidaId { get; set; }

        [Column("codbarras")]
        [StringLength(255)]
        public string? CodigoBarras { get; set; }

        [Column("referencia")]
        [StringLength(10)]
        public string? Referencia { get; set; }

        [Column("marcaid")]
        public int? MarcaId { get; set; }

        [Column("categoriaid")]
        public int? CategoriaId { get; set; }

        [Column("quantidademinima")]
        public int? QuantidadeMinima { get; set; }

        [Column("valorcompra")]
        public decimal? ValorCompra { get; set; }

        [Column("valorvenda")]
        public decimal? ValorVenda { get; set; }

        [Column("quantidade")]
        public int? Quantidade { get; set; }

        [Column("percentuallucro")]
        public decimal? PercentualLucro { get; set; }

        [Column("observacoes")]
        [StringLength(255)]
        public string? Observacoes { get; set; }

        [Column("situacao")]
        public DateTime? Situacao { get; set; }
    }
}
