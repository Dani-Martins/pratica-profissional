using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("forma_pagamento")]
    public class FormaPagamento
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("descricao")]
        [StringLength(255)]
        public string Descricao { get; set; } = string.Empty;
          // Conforme visto na imagem, o nome da coluna é situacao (minúsculo)
        [Column("situacao")]
        [Required]
        public byte Situacao { get; set; } = 1;
        
        // Conforme visto na imagem, o nome da coluna é datacriacao (minúsculo, sem underscore)
        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; } = DateTime.Now;
        
        // Conforme visto na imagem, o nome da coluna é dataalteracao (minúsculo, sem underscore)
        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; }
        
        // Conforme visto na imagem, o nome da coluna é usercriacao (minúsculo, sem underscore)
        [Column("usercriacao")]
        [StringLength(100)]
        [Required]
        public string UserCriacao { get; set; } = "Sistema";
        
        // Conforme visto na imagem, o nome da coluna é useralteracao (minúsculo, sem underscore)
        [Column("useralteracao")]
        [StringLength(100)]
        public string? UserAtualizacao { get; set; }
        
        // Alias para manter compatibilidade com código existente
        [NotMapped]
        public bool Ativo 
        { 
            get => Situacao == 1; 
            set => Situacao = value ? (byte)1 : (byte)0; 
        }
        
        // Alias para manter compatibilidade com código existente
        [NotMapped]
        public string Nome 
        { 
            get => Descricao; 
            set => Descricao = value; 
        }
    }
}
