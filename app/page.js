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
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
}

export default function Home() {
    const [inventory, setInventory] = useState([])
    const [open, setOpen] = useState(false)
    const [itemName, setItemName] = useState('')
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

    const addItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            await setDoc(docRef, { quantity: quantity + 1 })
        } else {
            await setDoc(docRef, { quantity: 1 })
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
            flexDirection={'column'}
            alignItems={'center'}
            gap={2}
        >
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add Item
                    </Typography>
                    <Stack width="100%" direction={'row'} spacing={2}>
                        <TextField
                            id="outlined-basic"
                            label="Item"
                            variant="outlined"
                            fullWidth
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => {
                                addItem(itemName)
                                setItemName('')
                                handleClose()
                            }}
                        >
                            Add
                        </Button>
                    </Stack>
                </Box>
            </Modal>
            <Stack direction="column" spacing={2} alignItems="center">
                <TextField
                    id="search-bar"
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleOpen}>
                        Add New Item
                    </Button>
                    <Button variant="contained" onClick={() => setSortType('A-Z')}>
                        Sort A-Z
                    </Button>
                    <Button variant="contained" onClick={() => setSortType('Z-A')}>
                        Sort Z-A
                    </Button>
                    <Button variant="contained" onClick={() => setQuantitySort('least-to-most')}>
                        Least to Most
                    </Button>
                    <Button variant="contained" onClick={() => setQuantitySort('most-to-least')}>
                        Most to Least
                    </Button>
                </Stack>
            </Stack>
            <Box border={'1px solid #333'}>
                <Box
                    width="800px"
                    height="100px"
                    bgcolor={'#ADD8E6'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                        Inventory Items
                    </Typography>
                </Box>
                <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
                    {inventory.map(({ name, quantity }) => (
                        <Box
                            key={name}
                            width="100%"
                            minHeight="150px"
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            bgcolor={'#f0f0f0'}
                            paddingX={5}
                        >
                            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </Typography>
                            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                                Quantity: {quantity}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" onClick={() => decreaseItem(name)}>
                                    Decrease
                                </Button>
                                <Button variant="contained" onClick={() => increaseItem(name)}>
                                    Increase
                                </Button>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}
