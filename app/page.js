'use client'
import Image from "next/image";
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    deleteDoc,
    getDoc,
} from 'firebase/firestore'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#fff',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
}

const searchSortContainerStyle = {
    bgcolor: '#fff',
    border: '1px solid #333',
    padding: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
}

export default function Home() {
    const [inventory, setInventory] = useState([])
    const [open, setOpen] = useState(false)
    const [itemName, setItemName] = useState('')
    const [itemQuantity, setItemQuantity] = useState(1)
    const [sortType, setSortType] = useState('A-Z')
    const [searchQuery, setSearchQuery] = useState('')
    const [quantitySort, setQuantitySort] = useState('none')

    const updateInventory = async () => {
        const snapshot = query(collection(firestore, 'inventory'))
        const docs = await getDocs(snapshot)
        const inventoryList = []
        docs.forEach((doc) => {
            inventoryList.push({ name: doc.id, ...doc.data() })
        })
        const filteredInventory = inventoryList.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setInventory(sortInventory(filteredInventory, sortType, quantitySort))
    }

    useEffect(() => {
        updateInventory()
    }, [sortType, searchQuery, quantitySort])

    const addItem = async (item, quantity) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const { quantity: existingQuantity } = docSnap.data()
            await setDoc(docRef, { quantity: existingQuantity + quantity })
        } else {
            await setDoc(docRef, { quantity })
        }
        await updateInventory()
    }

    const decreaseItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            if (quantity > 1) {
                await setDoc(docRef, { quantity: quantity - 1 })
            } else {
                await deleteDoc(docRef)
            }
        }
        await updateInventory()
    }

    const increaseItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            await setDoc(docRef, { quantity: quantity + 1 })
        }
        await updateInventory()
    }

    const sortInventory = (inventoryList, type, quantitySort) => {
        let sortedList = [...inventoryList]
        switch (type) {
            case 'A-Z':
                sortedList = sortedList.sort((a, b) => a.name.localeCompare(b.name))
                break;
            case 'Z-A':
                sortedList = sortedList.sort((a, b) => b.name.localeCompare(a.name))
                break;
        }
        switch (quantitySort) {
            case 'least-to-most':
                sortedList = sortedList.sort((a, b) => a.quantity - b.quantity)
                break;
            case 'most-to-least':
                sortedList = sortedList.sort((a, b) => b.quantity - a.quantity)
                break;
        }
        return sortedList
    }

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    return (
        <Box
            width="100vw"
            height="100vh"
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            flexDirection={'row'}
            gap={2}
        >
            <Box
                width="20vw"
                sx={searchSortContainerStyle}
                height="84vh"
                borderRadius={10}
            >
                <TextField
                    id="search-bar"
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        marginTop: 2,
                        marginBottom: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px'
                        },
                    }}
                />
                <Stack direction="column" spacing={2} borderRadius={10} width={'90%'} >
                    <Button variant="contained" onClick={handleOpen} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}}>
                        Add New Item
                    </Button>
                    <Button variant="contained" onClick={() => setSortType('A-Z')} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}} >
                        Sort A-Z
                    </Button>
                    <Button variant="contained" onClick={() => setSortType('Z-A')} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}}>
                        Sort Z-A
                    </Button>
                    <Button variant="contained" onClick={() => setQuantitySort('least-to-most')} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}}>
                        Least to Most
                    </Button>
                    <Button variant="contained" onClick={() => setQuantitySort('most-to-least')} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}}>
                        Most to Least
                    </Button>
                </Stack>
            </Box>
            <Box border={'1px solid #333'} width="70vw" borderRadius={10} overflow={'hidden'}>
                <Box
                    width="100%"
                    height="100px"
                    bgcolor={'#4D7CFF'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    marginBottom={2}
                    overflow={'hidden'}
                >
                    <Typography variant={'h2'} color={'#fff'} textAlign={'center'} fontWeight={'bold'}>
                        🥕PANTRY TRACKER🥕
                    </Typography>
                </Box>
                <Stack width="100%" height="500px" spacing={2} overflow={'auto'}>
                    {inventory.map(({ name, quantity }) => (
                        <Box
                            key={name}
                            width="90%"
                            minHeight="100px"
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignSelf={'center'}
                            alignItems={'center'}
                            bgcolor={'#4D7CFF'}
                            paddingX={5}
                            height={100}
                            mx="auto"
                            borderRadius={10}
                            overflow={'hidden'}
                        >
                            <Typography variant={'h3'} color={'#fff'} textAlign={'center'} fontSize={30}>
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </Typography>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                bgcolor="#4D7CFF"
                                color="#fff"
                                padding="8px 16px"
                                borderRadius={10}
                                border="1px solid #fff"
                            >
                                <Typography variant={'h3'} color={'#fff'} textAlign={'center'} fontSize={20}>
                                    Quantity: {quantity}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" onClick={() => decreaseItem(name)} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}}>
                                    Decrease
                                </Button>
                                <Button variant="contained" onClick={() => increaseItem(name)} sx={{backgroundColor: '#4D7CFF', '&:hover': {backgroundColor: '#4D7CAF',}}}>
                                    Increase
                                </Button>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ ...style, borderRadius: 10 }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add Item
                    </Typography>
                    <Stack width="100%" direction={'column'} spacing={2}>
                        <TextField
                            id="outlined-basic"
                            label="Item"
                            variant="outlined"
                            fullWidth
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                },
                            }}
                        />
                        <TextField
                            id="outlined-quantity"
                            label="Quantity"
                            variant="outlined"
                            type="number"
                            fullWidth
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                },
                            }}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => {
                                addItem(itemName, Number(itemQuantity))
                                setItemName('')
                                setItemQuantity(1)
                                handleClose()
                            }}
                            sx={{
                                backgroundColor: '#4D7CFF',
                                '&:hover': { backgroundColor: '#4D7CAF' },
                                color: '#fff'
                            }}
                        >
                            Add
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
}
