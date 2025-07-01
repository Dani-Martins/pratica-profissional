using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("produto_fornecedor")]
    public class ProdutoFornecedor
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required(ErrorMessage = "Produto é obrigatório")]
        [Column("produto_id")]
        public long ProdutoId { get; set; }

        [Required(ErrorMessage = "Fornecedor é obrigatório")]
        [Column("fornecedor_id")]
        public long FornecedorId { get; set; }

        [Column("codigo_prod")]
        [StringLength(50, ErrorMessage = "Código do produto deve ter no máximo 50 caracteres")]
        public string? CodigoProd { get; set; }

        [Column("custo", TypeName = "decimal(10,2)")]
        [Range(0, 999999.99, ErrorMessage = "Custo deve estar entre 0 e 999.999,99")]
        public decimal? Custo { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [ForeignKey("ProdutoId")]
        public virtual Produto? Produto { get; set; }

        [ForeignKey("FornecedorId")]
        public virtual Fornecedor? Fornecedor { get; set; }

        public virtual ICollection<ItemNFE>? ItensNFE { get; set; }
    }
}