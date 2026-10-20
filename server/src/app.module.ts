import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { InfluencersModule } from './modules/influencers/influencers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CmsModule } from './modules/cms/cms.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CartModule } from './modules/cart/cart.module';
import { CommunicationsModule } from './modules/communications/communications.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CatalogueModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    DeliveryModule,
    RewardsModule,
    InfluencersModule,
    SuppliersModule,
    CustomersModule,
    CmsModule,
    ReportsModule,
    NotificationsModule,
    WishlistModule,
    CartModule,
    CommunicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
