using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Nextekk.MomPop.Web.Hubs
{
    public class StockHub : Hub
    {
        public async Task UpdateStock()
        {
            await Clients.Others.SendAsync("stockChanged");
        }
    }
}
