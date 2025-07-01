using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("estado")]
    public class Estado
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("nome")]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Column("uf")]
        [StringLength(5)]  // Aumentado de 2 para 5 para acomodar diferentes formatos
        public string UF { get; set; } = string.Empty;        [Column("pais_id")]
        public long PaisId { get; set; }
        
        [Column("situacao")]
        public bool Situacao { get; set; } = true;

        [Column("data_criacao")]
        public DateTime DataCriacao { get; set; } = DateTime.Now;

        [Column("data_atualizacao")]
        public DateTime? DataAtualizacao { get; set; }

        [Column("user_criacao")]
        [StringLength(100)]
        public string? UserCriacao { get; set; }

        [Column("user_atualizacao")]
        [StringLength(100)]
        public string? UserAtualizacao { get; set; }

        // Propriedade de navegação com ForeignKey explícito
        [ForeignKey("PaisId")]
        public virtual Pais? Pais { get; set; }

        // Propriedade não mapeada para uso em DTOs
        [NotMapped]
        public string PaisNome { get; set; } = string.Empty;

        // Manter a propriedade de navegação para cidades
        public virtual ICollection<Cidade>? Cidades { get; set; }
    }
}
