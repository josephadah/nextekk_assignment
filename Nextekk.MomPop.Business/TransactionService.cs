using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nextekk.MomPop.Core.Helpers;
using Nextekk.MomPop.Core.Models.Entities;
using Nextekk.MomPop.Core.Repository;
using Nextekk.MomPop.Core.Services;

namespace Nextekk.MomPop.Business
{
    public class TransactionService : ITransactionService
    {
        private readonly IProductRepository _productRepository;
        private readonly ITransactionRepository _transactionRepository;

        public TransactionService(IProductRepository productRepository, ITransactionRepository transactionRepository)
        {
            _productRepository = productRepository;
            _transactionRepository = transactionRepository;
        }

        public Task<IEnumerable<OrderEntity>> GetAllOrderItems()
        {
            return _transactionRepository.GetAllOrders();
        }

        public async Task<OrderEntity> GetOrder(Guid id)
        {
            return await _transactionRepository.GetOrder(id);
        }

        public async Task<IEnumerable<OrderEntity>> GetOrders()
        {
            return await _transactionRepository.GetAllOrders();
        }

        public async Task ProcessCheckout(IEnumerable<OrderItemEntity> orderItems)
        {
            var productIds = orderItems.Select(x => x.ProductId);
            var products =  await _productRepository.GetProductsInIds(productIds);

            foreach (var product in products)
            {
                var orderQuantity = orderItems.FirstOrDefault(x => x.ProductId == product.Id).Quantity;
                product.Stock -= orderQuantity;
            }


            await  _productRepository.Update(products);
            //await CreateOrder(orderItems.ToList());
        }

        private async Task CreateOrder(IList<OrderItemEntity> orderItems)
        {
            var order = new OrderEntity { Id = Guid.NewGuid(), CreatedDate = DateTime.UtcNow };

            //order.Id = Guid.NewGuid(); another way to set Id;
            //order.CreatedDate = DateTime.UtcNow;

            foreach (var item in orderItems)
            {
                item.Id = Guid.NewGuid();
                item.OrderId = order.Id;
            }

            //using Extension Methods 
            //orderItems.ForEach(item =>
            //{
            //    item.Id = Guid.NewGuid();
            //    item.OrderId = order.Id;
            //}); 
            
            await  _transactionRepository.CreateOrder(order, orderItems);
        }
    }
}
