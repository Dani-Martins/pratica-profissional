using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("transp_item")]
    public class TranspItem
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("codigo")]
        [StringLength(20)]
        public string Codigo { get; set; } = string.Empty;

        [Column("descricao")]
        [StringLength(100)]
        public string? Descricao { get; set; }

        [Column("transportadora_id")]
        public long? TransportadoraId { get; set; }

        [Column("codigo_transp")]
        [StringLength(20)]
        public string? CodigoTransp { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [ForeignKey("TransportadoraId")]
        public virtual Transportadora? Transportadora { get; set; }
    }
}