// import React, { useState, createContext, useEffect } from "react";
// // import {
// //   createUserWithEmailAndPassword,
// //   signInWithEmailAndPassword,
// //   signOut,
// // } from "firebase/auth";
// import { deleteItemAsync, setItemAsync, getItemAsync } from "expo-secure-store";
// import {
//   FIREBASE_AUTH,
//   FIREBASE_DB,
//   FIREBASE_storage,
// } from "../FirebaseConfig";
// import {
//   setDoc,
//   doc,
//   getDoc,
//   getDocs,
//   addDoc,
//   collection,
//   deleteDoc,
// } from "firebase/firestore";
// import * as ImagePicker from "expo-image-picker";
// import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const Context = createContext();

// export const AuthoProvider = ({ children }) => {
//   const [darkmode, setdarkmode] = useState(false);
//   const [checked, setchecked] = useState(false);
//   const [error, setError] = useState("");
//   const [logged, setLogged] = useState("");
//   const [isLog, setIsLog] = useState(false);
//   const [userToken, setUserToken] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [productInCart, setProductInCart] = useState([]);
//   const [total, setTotal] = useState("");
//   const [blogs, setBlogs] = useState([]);

//   const pickImage = async (setIsLoading, setPicurl) => {
//     setIsLoading(true);
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setPicurl(result.assets[0].uri);
//       HandlePickImage(result.assets[0].uri, setPicurl);
//       setInterval(() => {
//         setIsLoading(false);
//       }, 2000);
//     } else {
//       setPicurl(null);
//       setInterval(() => {
//         setIsLoading(false);
//       }, 2000);
//     }
//   };

//   const HandlePickImage = async (img, setPicurl) => {
//     try {
//       if (!img) {
//         alert("Please select an image");
//       } else {
//         const timestamp = Date.now();
//         const fileExtension = img.split(".").pop();
//         var response = await fetch(img);
//         var blob = await response.blob();

//         const storagePath = `products/${timestamp}.${fileExtension}`;
//         console.log(storagePath);

//         const metadata = {
//           contentType: "image/jpeg",
//         };
//         const imageRef = ref(FIREBASE_storage, storagePath);

//         const upload = await uploadBytes(imageRef, blob, metadata);

//         console.log(upload);

//         var url = await getDownloadURL(imageRef);
//         console.log(url);

//         setPicurl(url);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const AddProduct = async (title, status, amount, picurl, userId) => {
//     try {
//       const response = await addDoc(collection(FIREBASE_DB, "products"), {
//         title: title,
//         status: status,
//         amount: amount,
//         picurl: picurl,
//         addedby: userId,
//       });
//     } catch (error) {
//       console.log(error);
//     }
//     ReadProduct();
//   };

//   const ReadProduct = async () => {
//     try {
//       const readResponse = await getDocs(collection(FIREBASE_DB, "products"));
//       setProducts(
//         readResponse.docs.map((doc) => ({
//           ...doc.data(),
//           id: doc.id,
//         }))
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const DeleteProduct = async (id) => {
//     try {
//       const deleteResponse = await deleteDoc(doc(FIREBASE_DB, "products", id));
//       const updatedProducts = products.filter(
//         (product) => product.id !== id
//       );
//       setProducts(updatedProducts);
//       alert("Item has been deleted successfully");
//       await ReadProduct();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const AddBlog = async (blogTitle, blogDescri, blogurl, agronomId) => {
//     try {
//       const response = await addDoc(collection(FIREBASE_DB, "blogs"), {
//         blogTitle: blogTitle,
//         blogDescri: blogDescri,
//         blogurl: blogurl,
//         agronomId: agronomId,
//       });
//     } catch (error) {
//       console.log(error);
//     }
//     ReadBlog();
//   };

//   const ReadBlog = async () => {
//     try {
//       const readResponse = await getDocs(collection(FIREBASE_DB, "blogs"));
//       setBlogs(
//         readResponse.docs.map((doc) => ({
//           ...doc.data(),
//           id: doc.id,
//         }))
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   function LogOut() {
//     setUserToken(null);
//     setLogged("");
//     setIsLog(false);
//     deleteItemAsync("userToken");
//     deleteItemAsync("userType");
//     deleteItemAsync("userEmail");
//     deleteItemAsync("userId");
//     return signOut(FIREBASE_AUTH);
//   }

//   const isLoggedIn = async () => {
//     try {
//       const userTok = await getItemAsync("userToken");
//       if (userTok != null) {
//         const userType = await getItemAsync("userType");
//         if (userType != null) {
//           setLogged(userType);
//           setIsLog(true);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     isLoggedIn();
//   }, []);

//   const changeMode = async () => {
//     const dark = !darkmode;
//     setdarkmode(dark);
//     try {
//       await AsyncStorage.setItem("currentMode", dark.toString());
//     } catch (error) {
//       console.error("Error updating mode:", error);
//     }
//   };
//   const Check = () => {
//     setchecked((prev) => !prev);
//   };
//   useEffect(() => {
//     const savedMode = async () => {
//       try {
//         const savedModeValue = await AsyncStorage.getItem("currentMode");
//         if (savedModeValue === "true") {
//           setdarkmode(true);
//         } else {
//           setdarkmode(false);
//         }
//       } catch (error) {
//         console.error("Error retrieving mode from AsyncStorage:", error);
//       }
//     };
//     savedMode();
//   }, []);

//   const handleAddToCart = async (productToAdd) => {
//     try {
//       if (!productToAdd || !productToAdd.id) {
//         console.log("Invalid productToAdd:", productToAdd);
//         return;
//       }

//       const item = await getItemAsync("products");

//       let listOfProducts = [];

//       if (item) {
//         listOfProducts = JSON.parse(item);
//       }

//       if (!listOfProducts) {
//         listOfProducts = [];
//       }

//       let checkForDuplicate = listOfProducts.filter(
//         (item) => item.id === productToAdd.id
//       );

//       if (checkForDuplicate.length < 1) {
//         productToAdd.count = 1;
//         listOfProducts.push(productToAdd);
//         alert("Product added to cart");
//       } else {
//         alert("Product already in cart");
//       }

//       await setItemAsync("products", JSON.stringify(listOfProducts));
//       DisplayCart();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const DisplayCart = async () => {
//     const item = await getItemAsync("products");
//     setProductInCart(JSON.parse(item));
//   };

//   const removeItemInCart = async (ItemId) => {
//     const item = await getItemAsync("products");

//     let listOfProducts = [];

//     listOfProducts = JSON.parse(item);
//     let remainingProduct = [];
//     if (listOfProducts !== null) {
//       remainingProduct = listOfProducts.filter((item) => item.id !== ItemId);
//       await setItemAsync("products", JSON.stringify(remainingProduct));
//       DisplayCart();
//     }
//   };

//   const incrementProducts = async (ItemId) => {
//     try {
//       const item = await getItemAsync("products");

//       if (!item) {
//         console.log("No products found");
//         return;
//       }

//       let listOfProducts = JSON.parse(item);
//       let getNewList = [];

//       if (listOfProducts) {
//         for (let product of listOfProducts) {
//           if (product.id === ItemId) {
//             let currentCount = product.count || 1;
//             product.count = Number(currentCount) + 1;
//           }
//           getNewList.push(product);
//         }

//         await setItemAsync("products", JSON.stringify(getNewList));
//         DisplayCart();
//       }
//     } catch (error) {
//       console.log("Error incrementing product:", error);
//     }
//   };

//   const decrementProducts = async (ItemId) => {
//     try {
//       const item = await getItemAsync("products");

//       if (!item) {
//         console.log("No products found");
//         return;
//       }

//       let listOfProducts = JSON.parse(item);
//       let getNewList = [];

//       if (listOfProducts) {
//         for (let product of listOfProducts) {
//           if (product.id === ItemId) {
//             let currentCount = product.count || 1;
//             if (currentCount === 1) {
//               await removeItemInCart(ItemId);
//               return;
//             }
//             product.count = Number(currentCount) - 1;
//           }
//           getNewList.push(product);
//         }

//         await setItemAsync("products", JSON.stringify(getNewList));
//         DisplayCart();
//       }
//     } catch (error) {
//       console.log("Error incrementing product:", error);
//     }
//   };

//   const AddFavorites= async (title, status, amount, picurl, userId) => {
//     try {
//       const response = await addDoc(collection(FIREBASE_DB, "favs"), {
//         title: title,
//         status: status,
//         amount: amount,
//         picurl: picurl,
//         addedby: userId,
//       });
//     } catch (error) {
//       console.log("Error adding to favorites:", error);
//     }
//   };

//   const DeleteFavorite = async (id) => {
//     try {
//       const deleteResponse = await deleteDoc(doc(FIREBASE_DB, "favs", id));
  
//       console.log("Delete Response:", deleteResponse);
//       return { success: true, message: "Successfully deleted" };
//     } catch (error) {
//       console.log("Delete Error:", error);
//       return { success: false, error };
//     }
//   };

  

//   useEffect(() => {
//     const sum = productInCart.reduce(
//       (acc, item) => acc + (item.count || 1) * item.amount, 0 );
//     setTotal(sum.toString());
//   }, [productInCart]);

//   return (
//     <Context.Provider
//       value={{
//         Regist: async (email, password, username, useType) => {
//           try {
//             const { user } = await createUserWithEmailAndPassword(
//               FIREBASE_AUTH,
//               email,
//               password
//             );
//             await setDoc(doc(FIREBASE_DB, "user", user.uid), {
//               email: email,
//               profUrl:
//                 "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
//               username: username,
//               usertype: useType,
//             });
//           } catch (error) {
//             console.error(error);
//             setError(error.code);
//           }
//         },
//         signin: async (email, password) => {
//           try {
//             const { user } = await signInWithEmailAndPassword(
//               FIREBASE_AUTH,
//               email,
//               password
//             );

//             setItemAsync("userId", user.uid);

//             const userToken = user.stsTokenManager.accessToken;
//             setUserToken(userToken);
//             setItemAsync("userToken", userToken);
//             setItemAsync("userEmail", email);
//             const userDocRef = await getDoc(doc(FIREBASE_DB, "user", user.uid));

//             if (userDocRef.exists()) {
//               const userData = userDocRef.data();
//               setItemAsync("userType", userData.usertype);

//               if (userData && userData.usertype == "farmer") {
//                 setLogged("farmer");
//                 setIsLog(true);
//               } else if (userData && userData.usertype == "buyer") {
//                 setLogged("buyer");
//                 setIsLog(true);
//               } else if (userData && userData.usertype == "plant pathologist") {
//                 setLogged("plant pathologist");
//                 setIsLog(true);
//               } else {
//                 console.log("Invalid account");
//               }
//             } else {
//               console.log("Document doesn't exist");
//             }
//           } catch (error) {
//             setError(error.code);
//           }
//         },
//         changeMode,
//         Check,
//         checked,
//         darkmode,
//         setdarkmode,
//         error,
//         isLog,
//         logged,
//         pickImage,
//         AddProduct,
//         ReadProduct,
//         products,
//         setProducts,
//         userToken,
//         LogOut,
//         handleAddToCart,
//         incrementProducts,
//         productInCart,
//         setProductInCart,
//         DisplayCart,
//         decrementProducts,
//         total,
//         AddBlog,
//         ReadBlog,
//         blogs,
//         setBlogs,
//         DeleteProduct,
//         AddFavorites,
//         DeleteFavorite,
//       }}
//     >
//       {children}
//     </Context.Provider>
//   );
// };
