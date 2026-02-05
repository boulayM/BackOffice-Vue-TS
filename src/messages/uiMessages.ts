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
    statusUpdated: "Commande mise a jour.",
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
    created: "Utilisateur cree avec succes.",
    updated: "Utilisateur modifie avec succes.",
    createError: "Erreur lors de la creation de l utilisateur.",
    updateError: "Erreur lors de la modification de l utilisateur.",
  },
};