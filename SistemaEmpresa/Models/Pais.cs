using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("pais")]
    public class Pais
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }  // Alterado de int para long

        [Required]
        [Column("nome")]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Column("sigla")]
        [StringLength(5)]
        public string Sigla { get; set; } = string.Empty;

        [Column("codigo")]
        [StringLength(5)]
        public string Codigo { get; set; } = string.Empty;
        
        [Column("situacao")]
        public int Situacao { get; set; } = 1; // 1 = Ativo por padrão
        
        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; } = DateTime.Now;
        
        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; } = null;
        
        [Column("usercriacao")]
        [StringLength(50)]
        public string UserCriacao { get; set; } = "SISTEMA";
        
        [Column("useralteracao")]
        [StringLength(50)]
        public string? UserAlteracao { get; set; } = null;

        // Propriedade de navegação
        public virtual ICollection<Estado> Estados { get; set; } = new List<Estado>();
    }
}
