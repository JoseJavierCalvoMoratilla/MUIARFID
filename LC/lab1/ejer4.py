# LC
# LAB - Sesion 1
# Jose Javier Calvo Moratilla
# Construir una funciÃ³n que devuelva las probabilidades lÃ©xicas P(C|w) y de emisiÃ³n
# P(w|C) para una palabra dada (w) para todas sus categorÃ­as (C) que aparecen en el
# P diccionario construido anteriormente. Si la palabra no existe en el diccionario debe
# decir que la palabra es desconocida

# Cadena del ejercicio
cadena = "El/DT perro/N come/V carne/N de/P la/DT carnicerÃ­a/N y/C de/P la/DT nevera/N y/C canta/V el/DT la/N la/N la/N ./Fp"

# Diccionario para las palabras y sus frecuencias con sus categorias + frecuencias
dic = {}

#Diccionario de categorias para ver su frecuencia total
cat = {}

# Lista para obtener las categorias de una palabra concreta para ser recorridas
categorias_de_word = []

# Variables para el computo
numero_palabras = 0
freq_word = 0
freq_cat_word = 0
freq_cat_total = 0
P_w = 0.0
P_c = 0.0
P_cat_word = 0.0
P_word_cat = 0.0

# FunciÃ³n de cÃ¡lculo de probabilidad
def compute(word):
  if dic.get(word) == None:
    return "La palabra es desconocida, no estÃ¡ en el diccionario"
  res = ''
  # Se obtienen las categorias para una word y la frecuencia de esa palabra  
  [categorias_de_word.append(item) for item in dic[word][1].items()] 
  freq_word = dic[word][0]   
  
  # Se recorren las categorias de palabras y se realizan los calculos para cada una
  for ca in categorias_de_word:
    #Se obtienen las frecuencias necesÃ¡rias para una categoria concreta    
    freq_cat_total = cat[ca[0]]    
    freq_cat_word = dic[word][1][ca[0]]

    # Calculo Probabilidadades
    P_c = freq_cat_total / numero_palabras
    P_cat_word = freq_cat_word / freq_word
    P_w = freq_word / numero_palabras
    
    #Calculo final Bayes : P(w|C) = P(w) * P(C|w) / P(C)
    P_word_cat = P_w * P_cat_word / P_c

    #printeo resultados
    res += 'P(' + str(ca[0]) + ' | ' + str(word) + ') = ' + str(P_cat_word) + ' \n'
    res += 'P(' + str(word) + ' | ' + str(ca[0]) + ') = ' + str(P_word_cat) + ' \n'
  return res   

# Se recorren todos los items
tokens = cadena.split()

for token in tokens:
    palabra = token.split('/')[0].lower()
    categoria = token.split('/')[1]
    #se aumenta el numero de palabras
    numero_palabras += 1    
    #Si no existe la clave la crea con su formato
    dic[palabra] = dic.get(palabra, [0,{}])
    #Una vez se asegura que la clave existe incrementa la freq de la palabra
    dic[palabra][0] += 1    
    #Ahora ya vemos si la categoria existe, si no existe la introduce e incrementa la freq
    dic[palabra][1][categoria] = dic[palabra][1].get(categoria, 0) + 1   
    #Se guarda la categoria y su frecuencia total para realizar los calculos posteriores
    cat[categoria] = cat.get(categoria, 0) + 1

print(compute('la'))