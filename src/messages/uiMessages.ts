export const uiMessages = {
  navigation: {
    notFound: "Page introuvable.",
  },
  orders: {
    deleteConfirm: "Voulez-vous vraiment supprimer cette commande ?",
    removeItemConfirm: "Voulez-vous vraiment retirer ce produit ?",
    created: (productName) => `Nouvelle commande creee avec ${productName}.`,
    addedToActive: (productName) =>
      `${productName} ajoute a la commande active.`,
  },
  products: {
    invalidForm: "Veuillez renseigner un nom et un prix valides.",
    updated: (name) => `Produit ${name} mis a jour.`,
    created: (name) => `Produit ${name} cree.`,
    deleteConfirm: (name) => `Voulez-vous vraiment supprimer ${name} ?`,
    deleted: (name) => `Produit ${name} supprime.`,
  },
  users: {
    deleteConfirm: (email) => `Supprimer ${email} ?`,
  },
};
