using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Swagger;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.PlatformAbstractions;
using Newtonsoft.Json;
using Nextekk.MomPop.Core.Services;
using Nextekk.MomPop.Business;
using Nextekk.MomPop.Core.Repository;
using Nextekk.MomPop.Data.Context;
using Nextekk.MomPop.Data.Repositories;
using Nextekk.MomPop.Web.Hubs;

namespace Nextekk.MomPop.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = Configuration.GetConnectionString("DefaultConnection");

            services.AddMvc().AddJsonOptions(options =>
            {
                options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                options.SerializerSettings.PreserveReferencesHandling = PreserveReferencesHandling.None;
            });

            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ITransactionService, TransactionService>();
            services.AddScoped<ITransactionRepository, TransactionRepository>();

            services.AddDbContext<NextekkMomPopDbContext>(opt => opt.UseSqlServer(connectionString));

            services.AddCors(options =>
            {
                options.AddPolicy("myCorsPolicy", 
                    builder =>
                {
                    builder.AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowAnyOrigin()
                            .AllowCredentials();
                });
            });

            services.AddSwaggerGen(opt =>
            {
                opt.SwaggerDoc("v1", new Info
                {
                    Title = "Nextekk Mom Pop",
                    Description = " This is web application for selling computers",
                    TermsOfService = string.Empty,
                    Contact = new Contact
                    {
                        Name = "NexTekk LLC",
                        Email = string.Empty,
                        Url = string.Empty
                    }
                });

                var basePath = Path.Combine(PlatformServices.Default.Application.ApplicationBasePath, "NexTekk.MomPop.Web.xml");

                opt.IncludeXmlComments(string.Format(basePath));
            });

            services.AddSignalR();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("myCorsPolicy");

            app.UseSwagger();
            app.UseSwaggerUI(x =>
            {
                x.SwaggerEndpoint("/swagger/v1/swagger.json", "NexTekk Mom Pop");
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<StockHub>("/stockhub");
            });

            app.UseMvc();

        }
    }
}
