using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("veiculo")]
    public class Veiculo
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("placa")]
        [StringLength(10)]
        public string Placa { get; set; } = string.Empty;

        [Column("modelo")]
        [StringLength(50)]
        public string? Modelo { get; set; }

        [Column("marca")]
        [StringLength(50)]
        public string? Marca { get; set; }

        [Column("ano")]
        public int? Ano { get; set; }

        [Column("capacidade")]
        public decimal? Capacidade { get; set; }

        [Column("transportadora_id")]
        public long? TransportadoraId { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [ForeignKey("TransportadoraId")]
        public virtual Transportadora? Transportadora { get; set; }
    }
}