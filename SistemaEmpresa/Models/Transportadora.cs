using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("transportadora")]
    public class Transportadora
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }  // Alterado de int para long

        [Required]
        [Column("razao_social")]
        [StringLength(150)]
        public string RazaoSocial { get; set; } = string.Empty;

        [Column("nome_fantasia")]
        [StringLength(100)]
        public string? NomeFantasia { get; set; }

        [Column("cnpj")]
        [StringLength(18)]
        public string CNPJ { get; set; } = string.Empty;

        [Column("email")]
        [StringLength(100)]
        public string? Email { get; set; }

        [Column("telefone")]
        [StringLength(20)]
        public string? Telefone { get; set; }

        [Column("endereco")]
        [StringLength(200)]
        public string? Endereco { get; set; }

        [Column("cidade_id")]
        public long? CidadeId { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [ForeignKey("CidadeId")]
        public virtual Cidade? Cidade { get; set; }

        [NotMapped]
        public string Numero { get; set; } = string.Empty;

        [NotMapped]
        public string? Complemento { get; set; }

        [NotMapped]
        public string Bairro { get; set; } = string.Empty;

        [NotMapped]
        public string Cep { get; set; } = string.Empty;

        [NotMapped]
        public string InscricaoEstadual { get; set; } = string.Empty;

        // Navegação para NFEs que usam esta transportadora
        public virtual ICollection<NFE> NFEs { get; set; } = new List<NFE>();
    }
}
