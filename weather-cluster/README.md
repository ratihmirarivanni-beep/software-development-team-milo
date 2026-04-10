# Weather Cluster 

## Deskripsi 

Weather Cluster adalah aplikasi sederhana yang dibuat untuk mengelompokkan data cuaca sekaligus menampilkan kondisi cuaca secara realtime.

Data yang digunakan berasal dari dataset cuaca di Kanggle, lalu diproses menggunakan metode K-Means untuk melihat pola atau pengelompokan tertentu. Selain itu, aplikasi ini juga terhubung dengan API cuaca, jadi pengguna bisa mencari nama kota dan langsung melihat kondisi cuaca saat ini.

## Fitur 

* Mengolah data cuaca dari dataset
* Clustering data menggunakan K-Means
* Mengambil data cuaca realtime dari API
* Pencarian kota
* Menampilkan suhu dan kondisi cuaca (misalnya hujan, cerah, atau berangin)

## Cara Kerja 

Pertama, data dari Kanggle diproses dan dikelompokkan menggunakan K-Means. Setelah itu, pengguna bisa memasukkan nama kota. Sistem akan mengambil data cuaca terbaru melalui API dan menampilkannya, seperti suhu dan kondisi cuaca saat itu.

## Tools yang digunakan 

* Python
* Pandas
* Scikit-learn
* Matplotlib

## Penutup

Aplikasi ini dibuat untuk membantu memahami pola cuaca dari data yang ada, sekaligus memberikan informasi cuaca terkini secara langsung.