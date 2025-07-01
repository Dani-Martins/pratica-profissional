using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("item_nfe")]
    public class ItemNFE
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("nfe_id")]
        public long NfeId { get; set; }

        [Required]
        [Column("produto_id")]
        public long ProdutoId { get; set; }

        [Required]
        [Column("quantidade")]
        public decimal Quantidade { get; set; }

        [Required]
        [Column("valor_unitario")]
        public decimal ValorUnitario { get; set; }

        [Required]
        [Column("valor_total")]
        public decimal ValorTotal { get; set; }

        [Required]
        [Column("desconto")]
        public decimal Desconto { get; set; }

        [ForeignKey("NfeId")]
        public virtual NFE? NFE { get; set; }

        [ForeignKey("ProdutoId")]
        public virtual Produto? Produto { get; set; }
    }
}
