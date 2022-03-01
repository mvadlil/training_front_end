import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LaporanPembelianBrowseComponent } from './browse/laporan-pembelian-buku-browse.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: null
    },
    children: [
      { path: '',
        data: {
          breadcrumb: null
        },
        component: LaporanPembelianBrowseComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaporanPembelianBukuRoutingModule { }

