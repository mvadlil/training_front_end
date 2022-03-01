import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainAppComponent } from './main-app.component';

const routes: Routes = [
  { path: '',
    component: MainAppComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: {
          breadcrumb: 'Dashboard',
          menucode: '001'
        },
        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },

      // domain
      {
        path: 'master/customer',
        data: {
          breadcrumb: 'Customer',
          menucode: '002008'
        },
        loadChildren: () => import('./master/customer/customer.module')
                                   .then((m) => m.CustomerModule),
      },
      {
        path: 'master/membership',
        data: {
          breadcrumb: 'Membership',
          menucode: '002009'
        },
        loadChildren: () => import('./master/membership/membership.module')
                                   .then((m) => m.MembershipModule),
      },
      {
        path: 'master/diskon',
        data: {
          breadcrumb: 'Diskon',
          menucode: '002010'
        },
        loadChildren: () => import('./master/diskon/diskon.module')
                                   .then((m) => m.DiskonModule),
      },
      {
        path: 'master/daftarBuku',
        data: {
          breadcrumb: 'DaftarBuku',
          menucode: '002011'
        },
        loadChildren: () => import('./master/daftarBuku/daftarbuku.module')
                                   .then((m) => m.DaftarbukuModule),
      },
      {
        path: 'transaksi/invoice-manual',
        data: {
          breadcrumb: 'InvoiceManual',
          menucode: '003001'
        },
        loadChildren: () => import('./transaksi/invoice-manual/invoice-manual.module')
                                   .then((m) => m.InvoiceManualModule),
      },
      {
        path: 'transaksi/pembelian-buku',
        data: {
          breadcrumb: 'PembelianBuku',
          menucode: '003002'
        },
        loadChildren: () => import('./transaksi/pembelian-buku/pembelian-buku.module')
                                   .then((m) => m.PembelianBukuModule),
      },
      {
        path: 'laporan/laporan-pembelian-buku',
        data: {
          breadcrumb: 'LaporanPembelianBuku',
          menucode: '003002'
        },
        loadChildren: () => import('./laporan/laporan-pembelian-buku/laporan-pembelian-buku.module')
                                   .then((m) => m.LaporanPembelianBukuModule),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainAppRoutingModule { }

