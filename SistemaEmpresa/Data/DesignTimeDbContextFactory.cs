using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace SistemaEmpresa.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Carregando configuração do appsettings.json
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            // Obtendo a string de conexão
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Criando as opções do DbContext
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // Configuração atualizada do MySQL
            optionsBuilder.UseMySql(
                connectionString, 
                ServerVersion.AutoDetect(connectionString),
                options => options.EnableRetryOnFailure()
            );

            // Criando o DbContext
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}