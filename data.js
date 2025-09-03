const productos = [
    {
      id: 1,
      nombre: "Lazo de Seda Rosa",
      categoria: "lazos",
      precio: 500,
      color: "Rosa",
      tela: "Seda",
      descripcion: "Lazo delicado de seda rosa ideal para eventos especiales.",
      imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/1000299606-3e534e2e7abe48c98217246736157837-640-0.jpg",
      imagenes: [
        "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
        "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
        "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg"
      ],
      compra: "details/details.html?id=1",
      status: "nuevo"
    },
    
    {
      id: 2,
      nombre: "Colita de Algodón Azul",
      categoria: "scrunchies",
      precio: 300,
      color: "Azul",
      tela: "Algodón",
      descripcion: "Colita cómoda y resistente, perfecta para el uso diario.",
      imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
      imagenes: [
        "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
        "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6f.jpg",
        "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6a.jpg"
      ],
      compra: "details/details.html?id=2",
      status: "oferta"
    },
    {
      id: 3,
      nombre: "Set de Moños Rojos de Seda",
      categoria: "setmonos",
      precio: 1200,
      color: "Rojo",
      tela: "Seda",
      descripcion: "Set de tres moños rojos con distintos diseños.",
      imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1643021-651e7433531d49a32d16750213968994-1024-1024.jpg",
      imagenes: [
        "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1643021-651e7433531d49a32d16750213968994-1024-1024.jpg",
        "https://i.pinimg.com/564x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2a3b4c5d6e7f.jpg",
        "https://i.pinimg.com/564x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2a3b4c5d6e7a.jpg"
      ],
      compra: "details/details.html?id=3",
      status: "none"
    },
    {
      id: 4,
      nombre: "Lazo Algodón Amarillo",
      categoria: "lazos",
      precio: 550,
      color: "Amarillo",
      tela: "Algodón",
      descripcion: "Alegre lazo amarillo para darle color a tu look.",
      imagen: "https://acdn-us.mitiendanube.com/stores/003/262/140/products/20241001_112314-9fc13ccf7b2cb6b53117277926650382-480-0.jpg",
      imagenes: [
        "https://acdn-us.mitiendanube.com/stores/003/262/140/products/20241001_112314-9fc13ccf7b2cb6b53117277926650382-480-0.jpg",
        "https://i.pinimg.com/564x/3a/4b/5c/3a4b5c6d7e8f9g0h1i2j3a4b5c6d7e8f.jpg",
        "https://i.pinimg.com/564x/3a/4b/5c/3a4b5c6d7e8f9g0h1i2j3a4b5c6d7e8a.jpg"
      ],
      compra: "details/details.html?id=4",
      status: "none"
    },
    {
        id: 5,
        nombre: "Lazo de Seda Azul Marino",
        categoria: "lazos",
        precio: 600,
        color: "Azul",
        tela: "Seda",
        descripcion: "Elegante lazo azul marino de seda para ocasiones formales.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/185/293/products/azul-oscuro1-410cc34722f23e182615913641959039-640-0.png",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/185/293/products/azul-oscuro1-410cc34722f23e182615913641959039-640-0.png",
            "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c7d8e9f0g1h2i3j4a5b6c7d8e9f.jpg",
            "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c7d8e9f0g1h2i3j4a5b6c7d8e9a.jpg"
        ],
        compra: "details/details.html?id=5",
        status: "none"
    },
    {
        id: 6,
        nombre: "Colita de Algodón Verde",
        categoria: "colitas",
        precio: 350,
        color: "Verde",
        tela: "Algodón",
        descripcion: "Colita fresca y juvenil en tono verde agua.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230727_1659461-bd56c1f8a58cd7434516904880221331-1024-1024.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230727_1659461-bd56c1f8a58cd7434516904880221331-1024-1024.jpg",
            "https://i.pinimg.com/564x/5a/6b/7c/5a6b7c8d9e0f1g2h3i4j5a6b7c8d9e0f.jpg",
            "https://i.pinimg.com/564x/5a/6b/7c/5a6b7c8d9e0f1g2h3i4j5a6b7c8d9e0a.jpg"
        ],
        compra: "details/details.html?id=6",
        status: "none"
    },
    {
        id: 7,
        nombre: "Set de Moños Pastel",
        categoria: "setmonos",
        precio: 1500,
        color: "Multicolor",
        tela: "Seda",
        descripcion: "Set de moños en tonos pastel, ideal para cualquier peinado.",
        imagen: "https://i.ebayimg.com/thumbs/images/g/fCYAAOSwdNFZb5En/s-l1200.jpg",
        imagenes: [
            "https://i.ebayimg.com/thumbs/images/g/fCYAAOSwdNFZb5En/s-l1200.jpg",
            "https://i.pinimg.com/564x/6a/7b/8c/6a7b8c9d0e1f2g3h4i5j6a7b8c9d0e1f.jpg",
            "https://i.pinimg.com/564x/6a/7b/8c/6a7b8c9d0e1f2g3h4i5j6a7b8c9d0e1a.jpg"
        ],
        compra: "details/details.html?id=7",
        status: "none"
        
    },
    {
        id: 8,
        nombre: "Lazo Negro de Terciopelo",
        categoria: "lazos",
        precio: 500,
        color: "Negro",
        tela: "Terciopelo",
        descripcion: "Lazo negro de terciopelo, un clásico indispensable.",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_f_Bu2FXvYM2nKW9bUWtujXDPeGF5JYrVag&s",
        imagenes: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_f_Bu2FXvYM2nKW9bUWtujXDPeGF5JYrVag&s",
            "https://i.pinimg.com/564x/7a/8b/9c/7a8b9c0d1e2f3g4h5i6j7a8b9c0d1e2f.jpg",
            "https://i.pinimg.com/564x/7a/8b/9c/7a8b9c0d1e2f3g4h5i6j7a8b9c0d1e2a.jpg"
        ],
        compra: "details/details.html?id=8",
        status: "agotado"
    },
    {
        id: 9,
        nombre: "Colita de Licra Roja",
        categoria: "colitas",
        precio: 320,
        color: "Rojo",
        tela: "Licra",
        descripcion: "Colita elástica roja, perfecta para un look deportivo o casual.",
        imagen: "https://d22fxaf9t8d39k.cloudfront.net/f22780102acc6453c242f987f61439d8f58c6e08945539d5e1394121049383ca2497.jpeg",
        imagenes: [
            "https://d22fxaf9t8d39k.cloudfront.net/f22780102acc6453c242f987f61439d8f58c6e08945539d5e1394121049383ca2497.jpeg",
            "https://i.pinimg.com/564x/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j8a9b0c1d2e3f.jpg",
            "https://i.pinimg.com/564x/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j8a9b0c1d2e3a.jpg"
        ],
        compra: "details/details.html?id=9",
        status: "none"
    },
    {
        id: 10,
        nombre: "Set de Moños Sintéticos",
        categoria: "setmonos",
        precio: 1800,
        color: "Plateado",
        tela: "Sintético",
        descripcion: "Moños con detalles brillantes para un toque de glamour.",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_819836-MLA52542668402_112022-O.webp",
        imagenes: [
            "https://http2.mlstatic.com/D_NQ_NP_819836-MLA52542668402_112022-O.webp",
            "https://i.pinimg.com/564x/9a/0b/1c/9a0b1c2d3e4f5g6h7i8j9a0b1c2d3e4f.jpg",
            "https://i.pinimg.com/564x/9a/0b/1c/9a0b1c2d3e4f5g6h7i8j9a0b1c2d3e4a.jpg"
        ],
        compra: "details/details.html?id=10",
        status: "none"
    },
    {
        id: 11,
        nombre: "Lazo Blanco Perla de Seda",
        categoria: "lazos",
        precio: 700,
        color: "Blanco",
        tela: "Seda",
        descripcion: "Lazo blanco con acabado perla, ideal para novias o eventos elegantes.",
        imagen: "https://d22fxaf9t8d39k.cloudfront.net/21df3236f0662fb7372dac3908c942546d4e23b213fb4873d7d56110187b9275125508.jpg",
        imagenes: [
            "https://d22fxaf9t8d39k.cloudfront.net/21df3236f0662fb7372dac3908c942546d4e23b213fb4873d7d56110187b9275125508.jpg",
            "https://i.pinimg.com/564x/0a/1b/2c/0a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5f.jpg",
            "https://i.pinimg.com/564x/0a/1b/2c/0a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5a.jpg"
        ],
        compra: "details/details.html?id=11",
        status: "none"
    },
    {
        id: 12,
        nombre: "Colita de Poliéster Naranja",
        categoria: "colitas",
        precio: 280,
        color: "Naranja",
        tela: "Poliéster",
        descripcion: "Colita de color naranja vibrante para un estilo audaz.",
        imagen: "https://dcdn-us.mitiendanube.com/stores/185/085/products/20211213_114807-3fd5163f69245168ae16394103290983-240-0.jpg",
        imagenes: [
            "https://dcdn-us.mitiendanube.com/stores/185/085/products/20211213_114807-3fd5163f69245168ae16394103290983-240-0.jpg",
            "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6f.jpg",
            "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6a.jpg"
        ],
        compra: "details/details.html?id=12",
        status: "none"
    },
    {
        id: 13,
        nombre: "Scrunchie Velvet Rosa",
        categoria: "scrunchies",
        precio: 400,
        color: "Rosa",
        tela: "Terciopelo",
        descripcion: "Scrunchie de terciopelo rosa, suave y elegante.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
            "https://i.pinimg.com/564x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2a3b4c5d6e7f.jpg",
            "https://i.pinimg.com/564x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2a3b4c5d6e7a.jpg"
        ],
        compra: "details/details.html?id=13",
        status: "none"
    },
    {
        id: 14,
        nombre: "Moño Individual Dorado",
        categoria: "monos",
        precio: 450,
        color: "Dorado",
        tela: "Sintético",
        descripcion: "Moño individual con acabado dorado brillante.",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_819836-MLA52542668402_112022-O.webp",
        imagenes: [
            "https://http2.mlstatic.com/D_NQ_NP_819836-MLA52542668402_112022-O.webp",
            "https://i.pinimg.com/564x/3a/4b/5c/3a4b5c6d7e8f9g0h1i2j3a4b5c6d7e8f.jpg",
            "https://i.pinimg.com/564x/3a/4b/5c/3a4b5c6d7e8f9g0h1i2j3a4b5c6d7e8a.jpg"
        ],
        compra: "details/details.html?id=14",
        status: "none"
    },
    {
        id: 15,
        nombre: "Scrunchie Satinado Azul",
        categoria: "scrunchies",
        precio: 380,
        color: "Azul",
        tela: "Seda",
        descripcion: "Scrunchie satinado azul, ideal para cuidar tu cabello.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
            "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c7d8e9f0g1h2i3j4a5b6c7d8e9f.jpg",
            "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c7d8e9f0g1h2i3j4a5b6c7d8e9a.jpg"
        ],
        compra: "details/details.html?id=15",
        status: "none"
    },
    {
        id: 16,
        nombre: "Moño Verde de Algodón",
        categoria: "monos",
        precio: 420,
        color: "Verde",
        tela: "Algodón",
        descripcion: "Moño individual verde fresco y juvenil.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230727_1659461-bd56c1f8a58cd7434516904880221331-1024-1024.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230727_1659461-bd56c1f8a58cd7434516904880221331-1024-1024.jpg",
            "https://i.pinimg.com/564x/5a/6b/7c/5a6b7c8d9e0f1g2h3i4j5a6b7c8d9e0f.jpg",
            "https://i.pinimg.com/564x/5a/6b/7c/5a6b7c8d9e0f1g2h3i4j5a6b7c8d9e0a.jpg"
        ],
        compra: "details/details.html?id=16",
        status: "none"
    },
    {
        id: 17,
        nombre: "Colita Estampada de Poliéster",
        categoria: "colitas",
        precio: 360,
        color: "Multicolor",
        tela: "Poliéster",
        descripcion: "Colita con estampado floral colorido y alegre.",
        imagen: "https://d22fxaf9t8d39k.cloudfront.net/f22780102acc6453c242f987f61439d8f58c6e08945539d5e1394121049383ca2497.jpeg",
        imagenes: [
            "https://d22fxaf9t8d39k.cloudfront.net/f22780102acc6453c242f987f61439d8f58c6e08945539d5e1394121049383ca2497.jpeg",
            "https://i.pinimg.com/564x/6a/7b/8c/6a7b8c9d0e1f2g3h4i5j6a7b8c9d0e1f.jpg",
            "https://i.pinimg.com/564x/6a/7b/8c/6a7b8c9d0e1f2g3h4i5j6a7b8c9d0e1a.jpg"
        ],
        compra: "details/details.html?id=17",
        status: "none"
    },
    {
        id: 18,
        nombre: "Pack de Scrunchies de Algodón",
        categoria: "scrunchies",
        precio: 900,
        color: "Multicolor",
        tela: "Algodón",
        descripcion: "Pack de 3 scrunchies en colores pastel suaves.",
        imagen: "https://i.ebayimg.com/thumbs/images/g/fCYAAOSwdNFZb5En/s-l1200.jpg",
        imagenes: [
            "https://i.ebayimg.com/thumbs/images/g/fCYAAOSwdNFZb5En/s-l1200.jpg",
            "https://i.pinimg.com/564x/7a/8b/9c/7a8b9c0d1e2f3g4h5i6j7a8b9c0d1e2f.jpg",
            "https://i.pinimg.com/564x/7a/8b/9c/7a8b9c0d1e2f3g4h5i6j7a8b9c0d1e2a.jpg"
        ],
        compra: "details/details.html?id=18",
        status: "none"
    },
    {
        id: 19,
        nombre: "Moño de Seda Blanco",
        categoria: "monos",
        precio: 480,
        color: "Blanco",
        tela: "Seda",
        descripcion: "Moño individual blanco elegante para ocasiones especiales.",
        imagen: "https://d22fxaf9t8d39k.cloudfront.net/21df3236f0662fb7372dac3908c942546d4e23b213fb4873d7d56110187b9275125508.jpg",
        imagenes: [
            "https://d22fxaf9t8d39k.cloudfront.net/21df3236f0662fb7372dac3908c942546d4e23b213fb4873d7d56110187b9275125508.jpg",
            "https://i.pinimg.com/564x/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j8a9b0c1d2e3f.jpg",
            "https://i.pinimg.com/564x/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j8a9b0c1d2e3a.jpg"
        ],
        compra: "details/details.html?id=19",
        status: "none"
    },
    {
        id: 20,
        nombre: "Set de Colitas de Licra",
        categoria: "colitas",
        precio: 750,
        color: "Negro",
        tela: "Licra",
        descripcion: "Set de 4 colitas deportivas negras, resistentes y cómodas.",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_f_Bu2FXvYM2nKW9bUWtujXDPeGF5JYrVag&s",
        imagenes: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_f_Bu2FXvYM2nKW9bUWtujXDPeGF5JYrVag&s",
            "https://i.pinimg.com/564x/9a/0b/1c/9a0b1c2d3e4f5g6h7i8j9a0b1c2d3e4f.jpg",
            "https://i.pinimg.com/564x/9a/0b/1c/9a0b1c2d3e4f5g6h7i8j9a0b1c2d3e4a.jpg"
        ],
        compra: "details/details.html?id=20",
        status: "none"
    },
    {
        id: 21,
        nombre: "Lazo de Seda Púrpura",
        categoria: "lazos",
        precio: 520,
        color: "Púrpura",
        tela: "Seda",
        descripcion: "Lazo elegante en tono púrpura, perfecto para un toque de color.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/1000299606-3e534e2e7abe48c98217246736157837-640-0.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/1000299606-3e534e2e7abe48c98217246736157837-640-0.jpg",
            "https://i.pinimg.com/564x/0a/1b/2c/0a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5f.jpg",
            "https://i.pinimg.com/564x/0a/1b/2c/0a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5a.jpg"
        ],
        compra: "details/details.html?id=21",
        status: "none"
    },
    {
        id: 22,
        nombre: "Moño de Terciopelo Gris",
        categoria: "monos",
        precio: 470,
        color: "Gris",
        tela: "Terciopelo",
        descripcion: "Moño individual de terciopelo gris, ideal para looks sofisticados.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1643021-651e7433531d49a32d16750213968994-1024-1024.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1643021-651e7433531d49a32d16750213968994-1024-1024.jpg",
            "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6f.jpg",
            "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6a.jpg"
        ],
        compra: "details/details.html?id=22",
        status: "none"
    },
    {
        id: 23,
        nombre: "Scrunchie de Algodón Salmón",
        categoria: "scrunchies",
        precio: 350,
        color: "Naranja",
        tela: "Algodón",
        descripcion: "Scrunchie de algodón en un suave tono salmón.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/710/678/products/20230129_1644291-7492141da58a844ac516750214887050-1024-1024.jpg",
            "https://i.pinimg.com/564x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2a3b4c5d6e7f.jpg",
            "https://i.pinimg.com/564x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2a3b4c5d6e7a.jpg"
        ],
        compra: "details/details.html?id=23",
        status: "none"
    },
    {
        id: 24,
        nombre: "Lazo con Textura Roja",
        categoria: "lazos",
        precio: 580,
        color: "Rojo",
        tela: "Algodón",
        descripcion: "Lazo rojo con una textura sutil, perfecto para el día a día.",
        imagen: "https://acdn-us.mitiendanube.com/stores/003/262/140/products/20241001_112314-9fc13ccf7b2cb6b53117277926650382-480-0.jpg",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/003/262/140/products/20241001_112314-9fc13ccf7b2cb6b53117277926650382-480-0.jpg",
            "https://i.pinimg.com/564x/3a/4b/5c/3a4b5c6d7e8f9g0h1i2j3a4b5c6d7e8f.jpg",
            "https://i.pinimg.com/564x/3a/4b/5c/3a4b5c6d7e8f9g0h1i2j3a4b5c6d7e8a.jpg"
        ],
        compra: "details/details.html?id=24",
        status: "none"
    },
    {
        id: 25,
        nombre: "Colita Lisa Negra",
        categoria: "colitas",
        precio: 290,
        color: "Negro",
        tela: "Sintético",
        descripcion: "Colita lisa en color negro, un básico esencial.",
        imagen: "https://d22fxaf9t8d39k.cloudfront.net/f22780102acc6453c242f987f61439d8f58c6e08945539d5e1394121049383ca2497.jpeg",
        imagenes: [
            "https://d22fxaf9t8d39k.cloudfront.net/f22780102acc6453c242f987f61439d8f58c6e08945539d5e1394121049383ca2497.jpeg",
            "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c7d8e9f0g1h2i3j4a5b6c7d8e9f.jpg",
            "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c7d8e9f0g1h2i3j4a5b6c7d8e9a.jpg"
        ],
        compra: "details/details.html?id=25",
        status: "none"
    },
    {
        id: 26,
        nombre: "Set de Moños con Brillos",
        categoria: "setmonos",
        precio: 1950,
        color: "Dorado",
        tela: "Poliéster",
        descripcion: "Set de moños dorados con destellos para fiestas y celebraciones.",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_819836-MLA52542668402_112022-O.webp",
        imagenes: [
            "https://http2.mlstatic.com/D_NQ_NP_819836-MLA52542668402_112022-O.webp",
            "https://i.pinimg.com/564x/5a/6b/7c/5a6b7c8d9e0f1g2h3i4j5a6b7c8d9e0f.jpg",
            "https://i.pinimg.com/564x/5a/6b/7c/5a6b7c8d9e0f1g2h3i4j5a6b7c8d9e0a.jpg"
        ],
        compra: "details/details.html?id=26",
        status: "none"
    },
    {
        id: 27,
        nombre: "Scrunchie con Diseño Floral",
        categoria: "scrunchies",
        precio: 450,
        color: "Multicolor",
        tela: "Algodón",
        descripcion: "Scrunchie con un delicado diseño floral, muy veraniego.",
        imagen: "https://i.ebayimg.com/thumbs/images/g/fCYAAOSwdNFZb5En/s-l1200.jpg",
        imagenes: [
            "https://i.ebayimg.com/thumbs/images/g/fCYAAOSwdNFZb5En/s-l1200.jpg",
            "https://i.pinimg.com/564x/6a/7b/8c/6a7b8c9d0e1f2g3h4i5j6a7b8c9d0e1f.jpg",
            "https://i.pinimg.com/564x/6a/7b/8c/6a7b8c9d0e1f2g3h4i5j6a7b8c9d0e1a.jpg"
        ],
        compra: "details/details.html?id=27",
        status: "nuevo"
    },
    {
        id: 28,
        nombre: "Moño Clásico Azul",
        categoria: "monos",
        precio: 400,
        color: "Azul",
        tela: "Seda",
        descripcion: "Moño individual de seda en un azul clásico.",
        imagen: "https://acdn-us.mitiendanube.com/stores/001/185/293/products/azul-oscuro1-410cc34722f23e182615913641959039-640-0.png",
        imagenes: [
            "https://acdn-us.mitiendanube.com/stores/001/185/293/products/azul-oscuro1-410cc34722f23e182615913641959039-640-0.png",
            "https://i.pinimg.com/564x/7a/8b/9c/7a8b9c0d1e2f3g4h5i6j7a8b9c0d1e2f.jpg",
            "https://i.pinimg.com/564x/7a/8b/9c/7a8b9c0d1e2f3g4h5i6j7a8b9c0d1e2a.jpg"
        ],
        compra: "details/details.html?id=28",
        status: "none"
    },
    {
        id: 29,
        nombre: "Colita de Terciopelo Rosa",
        categoria: "colitas",
        precio: 330,
        color: "Rosa",
        tela: "Terciopelo",
        descripcion: "Colita suave de terciopelo rosa, perfecta para peinados delicados.",
        imagen: "https://dcdn-us.mitiendanube.com/stores/185/085/products/20211213_114807-3fd5163f69245168ae16394103290983-240-0.jpg",
        imagenes: [
            "https://dcdn-us.mitiendanube.com/stores/185/085/products/20211213_114807-3fd5163f69245168ae16394103290983-240-0.jpg",
            "https://i.pinimg.com/564x/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j8a9b0c1d2e3f.jpg",
            "https://i.pinimg.com/564x/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j8a9b0c1d2e3a.jpg"
        ],
        compra: "details/details.html?id=29",
        status: "none"
    },
    {
        id: 30,
        nombre: "Set de Moños Bicolor",
        categoria: "setmonos",
        precio: 1650,
        color: "Negro",
        tela: "Licra",
        descripcion: "Set de moños en blanco y negro, un estilo moderno y versátil.",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_f_Bu2FXvYM2nKW9bUWtujXDPeGF5JYrVag&s",
        imagenes: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_f_Bu2FXvYM2nKW9bUWtujXDPeGF5JYrVag&s",
            "https://i.pinimg.com/564x/9a/0b/1c/9a0b1c2d3e4f5g6h7i8j9a0b1c2d3e4f.jpg",
            "https://i.pinimg.com/564x/9a/0b/1c/9a0b1c2d3e4f5g6h7i8j9a0b1c2d3e4a.jpg"
        ],
        compra: "details/details.html?id=30",
        status: "none"
    }
];